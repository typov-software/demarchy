<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Group } from '$lib/models/groups';
  import type { Organization } from '$lib/models/organizations';
  import type { Profile } from '$lib/models/profiles';
  import type { Amendment, Proposal } from '$lib/models/proposals';
  import { working, workingCallback } from '$lib/stores/working';
  import { pluralize } from '$lib/utils/string';
  import {
    collection,
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    updateDoc,
    writeBatch
  } from 'firebase/firestore';
  import { db, docStore, user } from '$lib/firebase';
  import MarkdownTextarea from '$lib/components/MarkdownTextarea.svelte';
  import { formatRelative } from 'date-fns';
  import type { Reaction, ReactionTally } from '$lib/models/reactions';
  import DocSelector from '$lib/components/DocSelector.svelte';
  import type { DocSummary } from '$lib/models/libraries';
  import AmendmentItem from './AmendmentItem.svelte';
  import { type Doc, type DocProps } from '$lib/models/docs';
  import { blurActive } from '$lib/utils/dom';
  import { makeDocument } from '$lib/models/utils';
  import uniq from 'lodash/uniq';
  import BallotCard from '$lib/components/BallotCard.svelte';
  import type { Ballot } from '$lib/models/ballots';
  import SeenCounter from '$lib/components/SeenCounter.svelte';

  export let profile: Profile;
  export let organization: Organization;
  export let group: Group;
  export let proposal: Proposal;
  export let ballot: null | Ballot;

  let reactionPath = `${proposal.path}/reactions/${$user!.uid}`;
  let reactionRef = doc(db, reactionPath);
  let tallyRef = doc(db, `${proposal.path}/tallies/reactions`);

  let reactionDoc = docStore<Reaction>(reactionRef.path);
  $: reaction = $reactionDoc;

  let tallyDoc = docStore<ReactionTally>(tallyRef.path);
  $: tally = $tallyDoc;

  let title = proposal.title;
  $: title;

  let description = proposal.description;
  $: description;

  $: saving = false;

  let liveProposal = docStore<Proposal>(proposal.path);
  $: amendments = Object.values($liveProposal?.amendments ?? {});
  $: nAmendments = amendments.length;

  $: state = $liveProposal ? $liveProposal.state : proposal.state;
  $: isOpen = state === 'open';
  $: editable = state === 'draft';
  $: ownsProposal = $liveProposal && $liveProposal.user_id === $user?.uid;
  $: hasChanges =
    $liveProposal && (title !== $liveProposal.title || description !== $liveProposal.description);

  let dropModal: HTMLDialogElement;
  let revertModal: HTMLDialogElement;
  let adoptModal: HTMLDialogElement;
  let amendmentsMenu: HTMLDivElement;

  let destroyDocModal: HTMLDialogElement;
  $: destroyDocModal;

  let updateDocModal: HTMLDialogElement;
  $: updateDocModal;

  $: mountDestroyDocSelector = false;
  $: mountUpdateDocSelector = false;

  async function saveForm() {
    if (saving || !hasChanges || !editable) return;
    saving = true;
    const job = working.add();
    const ref = doc(db, proposal.path);
    await updateDoc(ref, {
      title,
      description,
      updated_at: serverTimestamp()
    });
    working.remove(job);
    saving = false;
  }

  function handleShowDestroyDocModal() {
    destroyDocModal?.showModal();
    mountDestroyDocSelector = true;
  }

  function handleHideDestroyDocModal() {
    mountDestroyDocSelector = false;
  }

  function handleShowUpdateDocModal() {
    updateDocModal?.showModal();
    mountUpdateDocSelector = true;
  }

  function handleHideUpdateDocModal() {
    mountUpdateDocSelector = false;
  }

  async function handleCreateDoc() {
    blurActive();
    if (saving) return;
    saving = true;
    const ref = doc(db, proposal.path);
    const docRef = doc(collection(ref, 'docs'));
    const docProps: Omit<DocProps, 'created_at' | 'updated_at'> = {
      contributor_ids: [profile.id],
      user_id: profile.id,
      profile_handle: profile.handle,
      group_id: group.id,
      name: `Unnamed ${docRef.id}`,
      blocks: [
        {
          uid: crypto.randomUUID(),
          type: 'text',
          content: ''
        }
      ]
    };
    const amendment: Amendment = {
      doc: {
        id: docRef.id,
        path: docRef.path,
        name: docProps.name
      },
      type: 'create'
    };
    const batch = writeBatch(db);
    batch.set(docRef, {
      ...docProps,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    batch.set(
      ref,
      {
        amendments: { [docRef.id]: amendment },
        updated_at: serverTimestamp()
      },
      { merge: true }
    );
    try {
      await batch.commit();
    } catch (e) {
      const err = e as Error;
      console.error(err);
      alert(err.message);
    }
    saving = false;
  }

  async function handleSelectDestroyDoc(e: CustomEvent<DocSummary>) {
    if (saving) return;
    saving = true;
    destroyDocModal?.close();
    const amendment: Amendment = {
      doc: e.detail,
      type: 'destroy'
    };
    const ref = doc(db, proposal.path);
    try {
      await setDoc(
        ref,
        {
          amendments: { [e.detail.id]: amendment }
        },
        { merge: true }
      );
    } catch (e) {
      const err = e as Error;
      console.error(err);
      alert(err.message);
    }
    saving = false;
  }

  async function handleSelectUpdateDoc(e: CustomEvent<DocSummary>) {
    updateDocModal?.close();

    const ref = doc(db, proposal.path);

    // Get the source doc that we'll be updating
    const sourceRef = doc(db, e.detail.path);
    const sourceDoc = await getDoc(sourceRef);
    if (!sourceDoc.exists) {
      throw new Error('Source doc does not exist');
    }
    const sourceData = makeDocument<Doc>(sourceDoc);

    // Create a new doc with unique id that extends source doc
    const docRef = doc(collection(ref, 'docs'));
    const docProps: Omit<DocProps, 'created_at' | 'updated_at'> = {
      contributor_ids: uniq([...(sourceDoc.data()?.contributor_ids?.slice() ?? []), profile.id]),
      user_id: profile.id,
      profile_handle: profile.handle,
      group_id: group.id,
      name: sourceData.name,
      blocks: sourceData.blocks.slice()
    };
    const amendment: Amendment = {
      type: 'update',
      doc: {
        id: docRef.id,
        path: docRef.path,
        name: e.detail.name
      },
      update: {
        doc: e.detail
      }
    };

    const batch = writeBatch(db);
    batch.set(docRef, {
      ...docProps,
      // use original doc timestamp
      created_at: sourceDoc.data()!.created_at,
      updated_at: serverTimestamp()
    });
    batch.set(
      ref,
      {
        amendments: { [docRef.id]: amendment },
        updated_at: serverTimestamp()
      },
      { merge: true }
    );
    try {
      await batch.commit();
    } catch (e) {
      const err = e as Error;
      console.error(err);
      alert(err.message);
    }
  }

  async function handleRemoveAmendment(amendment: Amendment) {
    const ref = doc(db, proposal.path);
    const amendments = { ...($liveProposal?.amendments ?? {}) };
    delete amendments[amendment.doc.id];
    await updateDoc(ref, { amendments });
  }
</script>

<div class="card bg-base-200 max-w-3xl w-full rounded-box">
  <div
    class="card-title text-xs font-semibold bg-base-300 pl-4 pr-2 py-2 rounded-box"
    style:border-bottom-left-radius="0"
    style:border-bottom-right-radius="0"
  >
    <h3 class="flex-1">
      Created by
      <a class="link link-success" href={`/d/profiles/${proposal.profile_handle}`}
        >@{proposal.profile_handle}</a
      >
      {formatRelative(proposal.created_at, new Date())}
    </h3>

    <div class="flex-1" />
    <span
      class="text-xs rounded-full py-1 px-2"
      class:bg-info={state === 'draft'}
      class:bg-success={state === 'open'}
      class:bg-warning={state === 'dropped'}
      class:bg-error={state === 'archived'}
    >
      {state}
    </span>
    {#if editable}
      <button class="btn btn-square btn-sm btn-ghost">
        <span class="material-symbols-outlined">draft</span>
      </button>
    {/if}
    {#if ownsProposal && isOpen && !editable}
      <div class="dropdown dropdown-bottom dropdown-end">
        <button class="btn btn-square btn-sm"
          ><span class="material-symbols-outlined">more_vert</span></button
        >
        <ul class="dropdown-content w-60 menu z-[1] shadow bg-base-100 rounded-box">
          <li>
            <button
              class="flex items-center gap-2 text-warning w-full flex-1"
              on:click={() => revertModal?.showModal()}
            >
              <span class="material-symbols-outlined">undo</span>
              Revert to draft</button
            >
          </li>
          <li>
            <button
              class="flex items-center gap-2 text-error w-full flex-1"
              on:click={() => dropModal?.showModal()}
            >
              <span class="material-symbols-outlined">cancel_presentation</span>
              Drop proposal</button
            >
          </li>
        </ul>
      </div>
    {/if}
  </div>

  <div class="card-body p-4 gap-2">
    <input
      bind:value={title}
      form="proposal-form"
      type="text"
      id="title"
      name="title"
      class="input text-xl bg-base-200 rounded-none font-bold px-2 disabled:text-base-content font-noto"
      disabled={!editable}
      class:pointer-events-none={!editable}
      placeholder="Proposal Title"
      on:blur={() => saveForm()}
    />
    <MarkdownTextarea
      bind:value={description}
      name="description"
      placeholder="Describe the intentions and changes of this proposal"
      {editable}
      on:blur={() => {
        if (description !== $liveProposal?.description) {
          saveForm();
        }
      }}
    />

    {#if editable}
      <div class="card-actions h-10 mt-2">
        <div class="flex-1" />
        <div class="dropdown dropdown-bottom">
          <div
            role="button"
            tabindex="0"
            bind:this={amendmentsMenu}
            class="btn btn-sm btn-neutral"
            style:height="35px"
          >
            <span class="material-symbols-outlined">history_edu</span>
            Amendments
          </div>
          <ul class="menu w-80 z-[1] dropdown-content shadow bg-base-300 rounded-box">
            <li>
              <button on:click={handleCreateDoc}>
                <span class="material-symbols-outlined">post_add</span>
                Create a Doc
              </button>
            </li>
            <li>
              <button on:click={handleShowUpdateDocModal}>
                <span class="material-symbols-outlined">edit_note</span>
                Update a Doc</button
              >
            </li>
            <li>
              <button on:click={handleShowDestroyDocModal}>
                <span class="material-symbols-outlined">delete</span>
                Destroy a Doc</button
              >
            </li>
            <li>
              <button on:click|preventDefault={() => ({})}>
                <span class="material-symbols-outlined">tune</span>
                Update a Setting</button
              >
            </li>
          </ul>
        </div>

        <form method="post" action="?/openProposal" use:enhance={workingCallback()}>
          <input type="hidden" name="path" value={proposal.path} />
          <button class="btn btn-success btn-sm h-9">
            <span class="material-symbols-outlined">present_to_all</span>
            Open Proposal</button
          >
        </form>
      </div>
    {/if}
    {#if isOpen && tally}
      <div class="flex">
        <div class="flex-1" />
        <!-- <button
          class="flex flex-row items-center btn btn-xs"
          class:btn-filled={!reaction}
          class:btn-neutral={!reaction}
          class:btn-primary={reaction}
          class:pointer-events-none={reaction}
          on:click={handleClickSeen}
        >
          {#if saving}
            <div class="loading loading-xs loading-spinner" />
          {:else}
            <span class="material-symbols-outlined text-base">
              {reaction ? 'visibility' : 'visibility_off'}
            </span>
          {/if}
          0
        </button> -->
        <SeenCounter
          context="proposals"
          contextId={proposal.id}
          {reaction}
          {reactionPath}
          {tally}
        />
      </div>
    {/if}
  </div>
</div>

{#if nAmendments}
  <h2 class="divider divider-neutral w-full text-sm m-0">
    {nAmendments}
    {pluralize('Amendment', nAmendments)}
  </h2>
  <div class="flex flex-col items-center w-full gap-2">
    {#each amendments as amendment (amendment.doc.id)}
      <AmendmentItem
        {amendment}
        proposal={$liveProposal ?? proposal}
        {editable}
        docsRoute={`/d/${organization.slug}/${group.id}/docs`}
        on:remove={(e) => handleRemoveAmendment(e.detail)}
      />
    {/each}
  </div>
{/if}

{#if isOpen}
  <h2 class="divider divider-info w-full text-sm m-0">Consensus</h2>
  <!-- <div class="flex flex-wrap items-center w-full gap-2">
    <button class="btn">Add clarifying question or concern</button>
    <button class="btn">Block proposal</button>
    <button class="btn" on:click={() => adoptModal.showModal()}>Adopt proposal</button>
  </div> -->

  {#if ballot && $user}
    <div class="w-full max-w-3xl">
      <BallotCard {ballot} contextPath={proposal.path} voterId={$user.uid} />
    </div>
  {/if}
{/if}

<dialog id="drop-proposal" class="modal" bind:this={dropModal}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">Warning</h3>
    <p class="py-4">Are you sure you want to drop this proposal?</p>

    <div class="flex justify-end gap-2">
      <button class="btn btn-info" on:click={() => dropModal.close()}>No, keep it open</button>
      <form
        method="post"
        action="?/dropProposal"
        use:enhance={workingCallback({
          onStart() {
            dropModal?.close();
          },
          reset: true
        })}
      >
        <input type="hidden" name="path" value={proposal.path} />
        <button class="btn btn-error btn-outline">I'm sure, drop it</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<dialog id="revert-to-draft" class="modal" bind:this={revertModal}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">Warning</h3>
    <p class="py-4">Are you sure you want to revert this proposal to a draft?</p>

    <div class="flex justify-end gap-2">
      <button class="btn btn-info" on:click={() => revertModal.close()}>No, keep it open</button>
      <form
        method="post"
        action="?/revertToDraft"
        use:enhance={workingCallback({
          onStart() {
            revertModal?.close();
          },
          reset: true
        })}
      >
        <input type="hidden" name="path" value={proposal.path} />
        <button class="btn btn-warning btn-outline">I'm sure, revert to draft</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<dialog id="adopt-proposal" class="modal" bind:this={adoptModal}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">Warning</h3>
    <p class="py-4">
      This bypasses the planned consensus process. Are you sure you want to adopt this proposal?
    </p>

    <div class="flex justify-end gap-2">
      <button class="btn btn-secondary" on:click={() => adoptModal.close()}>No</button>
      <form
        method="post"
        action="?/DEV_adoptProposal"
        use:enhance={workingCallback({
          onStart() {
            adoptModal?.close();
          },
          reset: true
        })}
      >
        <input type="hidden" name="path" value={proposal.path} />
        <input type="hidden" name="organization_id" value={organization.id} />
        <button class="btn btn-primary">I'm sure, immediately adopt this</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<dialog
  id="destroy-doc-modal"
  class="modal"
  bind:this={destroyDocModal}
  on:close={handleHideDestroyDocModal}
>
  <div class="modal-box">
    <p class="py-4">Select a document to remove from the group library.</p>
    <div class="flex">
      {#if mountDestroyDocSelector}
        <DocSelector {organization} {group} on:select={handleSelectDestroyDoc} />
      {/if}
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<dialog
  id="update-doc-modal"
  class="modal"
  bind:this={updateDocModal}
  on:close={handleHideUpdateDocModal}
>
  <div class="modal-box">
    <p class="py-4">Select a document to update from the library.</p>
    <div class="flex">
      {#if mountUpdateDocSelector}
        <DocSelector {organization} {group} on:select={handleSelectUpdateDoc} />
      {/if}
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
