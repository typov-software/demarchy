<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Group } from '$lib/models/groups';
  import type { Organization } from '$lib/models/organizations';
  import type { Profile } from '$lib/models/profiles';
  import type { Proposal } from '$lib/models/proposals';
  import { working } from '$lib/stores/working';
  import { pluralize } from '$lib/utils/string';
  import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
  import { db, docStore, user } from '$lib/firebase';
  import MarkdownTextarea from '$lib/components/MarkdownTextarea.svelte';
  import { formatRelative } from 'date-fns';
  import type { Reaction } from '$lib/models/reactions';
  import DocSelector from '$lib/components/DocSelector.svelte';
  import type { DocSummary } from '$lib/models/libraries';
  import Amendment from './Amendment.svelte';

  export let profile: Profile;
  export let organization: Organization;
  export let group: Group;
  export let proposal: Proposal;

  let reaction: null | Reaction;
  $: reaction = null;

  let title = proposal.title;
  $: title;

  let description = proposal.description;
  $: description;

  $: saving = false;

  let liveProposal = docStore<Proposal>(proposal.path);
  $: amendments = Object.values($liveProposal?.amendments ?? {});
  $: nAmendments = amendments.length;

  $: isOpen = $liveProposal?.state === 'open';
  $: editable = $liveProposal?.state === 'draft';
  $: ownsProposal = $liveProposal && $liveProposal.user_id === $user?.uid;
  $: hasChanges =
    $liveProposal && (title !== $liveProposal.title || description !== $liveProposal.description);

  let dropModal: HTMLDialogElement;
  let revertModal: HTMLDialogElement;
  let adoptModal: HTMLDialogElement;

  let destroyDocModal: HTMLDialogElement;
  $: destroyDocModal;
  $: mountDocSelector = false;

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

  function handleClickSeen() {
    //
  }

  function handleShowDestroyDocModal() {
    destroyDocModal?.showModal();
    mountDocSelector = true;
  }

  function handleHideDestroyDocModal() {
    mountDocSelector = false;
  }

  async function handleSelectDestroyDoc(e: CustomEvent<DocSummary>) {
    console.log(e, e.detail);
    // add proposal amendment
    const ref = doc(db, proposal.path);
    await updateDoc(ref, {
      amendments: {
        ...proposal.amendments,
        [e.detail.id]: {
          doc_id: e.detail.id,
          doc_name: e.detail.name,
          type: 'destroy'
        }
      }
    });
  }
</script>

<div class="card bg-base-200 max-w-4xl w-full rounded-lg">
  <div
    class="card-title text-xs font-semibold bg-base-300 pl-4 pr-2 py-2 rounded-lg"
    style:border-bottom-left-radius="0"
    style:border-bottom-right-radius="0"
  >
    <h3 class="flex-1">
      Created by
      <a class="link link-success" href={`/d/profiles/${proposal.user_handle}`}
        >@{proposal.user_handle}</a
      >
      {formatRelative(proposal.created_at, new Date())}
    </h3>
    {#if editable}
      <button class="btn btn-square btn-sm btn-ghost rounded-lg">
        <span class="material-symbols-outlined">draft</span>
      </button>
    {/if}
    {#if ownsProposal && isOpen && !editable}
      <div class="dropdown dropdown-bottom dropdown-end">
        <button class="btn btn-square btn-sm rounded-lg"
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
      inputName="description"
      placeholder="Describe the intentions and changes of this proposal"
      {editable}
      onSave={async () => {
        if (description !== $liveProposal?.description) {
          await saveForm();
        }
      }}
    />

    {#if editable}
      <div class="card-actions h-10 mt-2">
        <div class="flex-1" />
        <div class="dropdown dropdown-bottom dropdown-hover">
          <div
            role="button"
            tabindex="0"
            class="btn btn-sm rounded-lg btn-neutral"
            style:height="35px"
          >
            <span class="material-symbols-outlined">history_edu</span>
            Amendments
          </div>
          <ul class="menu w-80 z-[1] dropdown-content shadow bg-base-300 rounded-box">
            <li>
              <form
                id="add-doc"
                class="hidden"
                method="post"
                action="?/addDoc"
                use:enhance={() => {
                  const job = working.add();
                  return ({ update }) => {
                    working.remove(job);
                    update({ reset: true });
                  };
                }}
              >
                <input type="hidden" name="organization_id" value={organization.id} />
                <input type="hidden" name="group_id" value={group.id} />
                <input type="hidden" name="user_handle" value={profile.handle} />
                <input type="hidden" name="proposal_id" value={proposal.id} />
              </form>
              <button form="add-doc" type="submit">
                <span class="material-symbols-outlined">post_add</span>
                Create a Doc
              </button>
            </li>
            <li>
              <button on:click|preventDefault={() => ({})}>
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

        <form
          method="post"
          action="?/openProposal"
          use:enhance={() => {
            const job = working.add();
            return ({ update }) => {
              working.remove(job);
              update({ reset: false });
            };
          }}
        >
          <input type="hidden" name="path" value={proposal.path} />
          <button class="btn btn-success btn-sm rounded-lg h-9">
            <span class="material-symbols-outlined">present_to_all</span>
            Open Proposal</button
          >
        </form>
      </div>
    {/if}
    {#if isOpen}
      <div class="flex">
        <div class="flex-1" />
        <button
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
        </button>
      </div>
    {/if}
  </div>
</div>

{#if nAmendments}
  <h2 class="divider divider-info w-full text-sm m-0">
    {nAmendments}
    {pluralize('Amendment', nAmendments)}
  </h2>
  <div class="flex flex-col items-center w-full gap-2">
    {#each amendments as amendment (amendment.doc_id)}
      <Amendment {amendment} proposal={$liveProposal ?? proposal} {editable} />
    {/each}
  </div>
{/if}

{#if isOpen}
  <h2 class="divider divider-success w-full text-sm m-0">Consensus</h2>
  <div class="flex flex-wrap items-center w-full gap-2">
    <!-- <button class="btn">Add clarifying question or concern</button>
    <button class="btn">Block proposal</button> -->
    <button class="btn" on:click={() => adoptModal.showModal()}>Adopt proposal</button>
  </div>
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
        use:enhance={() => {
          dropModal?.close();
          const job = working.add();
          return ({ update }) => {
            working.remove(job);
            update({ reset: true });
          };
        }}
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
        use:enhance={() => {
          revertModal?.close();
          const job = working.add();
          return ({ update }) => {
            working.remove(job);
            update({ reset: true });
          };
        }}
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
        use:enhance={() => {
          adoptModal?.close();
          const job = working.add();
          return ({ update }) => {
            working.remove(job);
            update({ reset: true });
          };
        }}
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
    <h3 class="font-bold text-lg">Warning</h3>
    <p class="py-4">Select a document to remove from the group library.</p>
    <div class="flex">
      {#if mountDocSelector}
        <DocSelector {organization} {group} on:select={handleSelectDestroyDoc} />
      {/if}
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
