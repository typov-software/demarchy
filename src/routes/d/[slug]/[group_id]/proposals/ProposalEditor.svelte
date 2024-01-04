<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Group } from '$lib/models/groups';
  import type { Organization } from '$lib/models/organizations';
  import type { Profile } from '$lib/models/profiles';
  import type { Proposal } from '$lib/models/proposals';
  import { working } from '$lib/stores/working';
  import DocEditor from '../docs/DocEditor.svelte';
  import type { Doc } from '$lib/models/docs';
  import { pluralize } from '$lib/utils/string';
  import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
  import { db, docStore } from '$lib/firebase';
  import MarkdownTextarea from '$lib/components/MarkdownTextarea.svelte';

  export let profile: Profile;
  export let organization: Organization;
  export let group: Group;
  export let proposal: Proposal;
  export let docs: Doc[];

  let title = proposal.title;
  $: title;

  let description = proposal.description;
  $: description;

  $: nAmendments = Object.keys(proposal.amendments).length;
  $: saving = false;

  let liveProposal = docStore<Proposal>(proposal.path);

  async function saveForm() {
    if (saving) return;
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
</script>

<div class="card bg-base-200 max-w-4xl w-full rounded-lg">
  <div class="card-body p-4 gap-4">
    <input
      bind:value={title}
      form="proposal-form"
      type="text"
      id="title"
      name="title"
      class="input bg-base-300 rounded-lg"
      placeholder="Proposal Title"
      on:blur={() => saveForm()}
    />
    <MarkdownTextarea
      bind:value={description}
      inputName="description"
      placeholder="Describe the intentions and changes of this proposal"
      onSave={async () => {
        if (description !== $liveProposal?.description) {
          await saveForm();
        }
      }}
    />

    <div class="card-actions items-center">
      <div class="dropdown dropdown-bottom dropdown-hover">
        <div role="button" tabindex="0" class="btn rounded-xl btn-warning">
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
              Add a Doc
            </button>
          </li>
          <li>
            <button on:click|preventDefault={() => ({})}>
              <span class="material-symbols-outlined">edit_note</span>
              Update a Doc</button
            >
          </li>
          <li>
            <button on:click|preventDefault={() => ({})}>
              <span class="material-symbols-outlined">delete</span>
              Destroy a Doc</button
            >
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>

{#if nAmendments}
  <h2 class="divider divider-primary w-full text-sm m-0">
    {nAmendments}
    {pluralize('Amendment', nAmendments)}
  </h2>
  <div class="flex flex-col items-center w-full gap-2">
    {#each docs as doc (doc.id)}
      <DocEditor {doc} amendment={proposal.amendments[doc.id]} />
    {/each}
  </div>
{/if}
