<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Group } from '$lib/models/groups';
  import type { Organization } from '$lib/models/organizations';
  import type { Profile } from '$lib/models/profiles';
  import type { Proposal } from '$lib/models/proposals';
  import { autosize } from '$lib/stores/use-autosize';
  import { working } from '$lib/stores/working';
  import { onMount } from 'svelte';
  import SvelteMarkdown from 'svelte-markdown';
  import DocEditor from '../docs/DocEditor.svelte';
  import type { Doc } from '$lib/models/docs';
  import { pluralize } from '$lib/utils/string';
  import HtmlRenderer from '$lib/components/HtmlRenderer.svelte';

  export let profile: Profile;
  export let organization: Organization;
  export let group: Group;
  export let proposal: Proposal;
  export let docs: Doc[];

  $: title = '';
  $: description = '';

  $: nAmendments = Object.keys(proposal.amendments).length;

  onMount(() => {
    title = proposal.title;
    description = proposal.description;
  });

  $: hasChanges = title !== proposal.title || description !== proposal.description;
  $: canSave = title.trim().length > 0;
  $: viewRaw = true;
</script>

<div class="card bg-base-200 max-w-4xl w-full rounded-lg">
  <form id="proposal-form" method="post" action="?/saveProposal" />
  <div class="card-body p-4 gap-4">
    <input
      bind:value={title}
      form="proposal-form"
      type="text"
      id="title"
      name="title"
      class="input bg-base-300 rounded-lg"
      placeholder="Proposal Title"
    />
    {#if viewRaw}
      <textarea
        use:autosize
        form="proposal-form"
        class="textarea bg-base-300 rounded-lg"
        name="description"
        id="description"
        placeholder="Describe the intentions and changes of this proposal"
        rows={3}
        autocomplete="off"
        bind:value={description}
      ></textarea>
    {:else}
      <div class="markdown-body p-4 bg-base-300 rounded-xl">
        <input
          form="proposal-form"
          type="hidden"
          id="description"
          name="description"
          value={description}
        />
        <SvelteMarkdown source={description} renderers={{ html: HtmlRenderer }} />
      </div>
    {/if}

    <div class="flex flex-1 gap-2">
      <button
        class="btn btn-xs text-xs"
        class:btn-error={viewRaw}
        on:click={(e) => {
          e.preventDefault();
          viewRaw = true;
        }}>Raw</button
      >
      <button
        class="btn btn-xs text-xs"
        disabled={!description.trim().length}
        class:btn-success={!viewRaw}
        on:click={(e) => {
          e.preventDefault();
          viewRaw = false;
        }}>Formatted</button
      >
    </div>
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
      <div class="flex-1" />
      <button
        form="proposal-form"
        type="submit"
        class="btn btn-success rounded-xl"
        disabled={!hasChanges || !canSave}
      >
        <span class="material-symbols-outlined">edit_note</span>
        {proposal ? 'Save' : 'Create'}
      </button>
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
