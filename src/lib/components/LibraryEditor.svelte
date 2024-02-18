<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Group } from '$lib/models/groups';
  import {
    organizeLibrary,
    type Library,
    type LibraryShelf,
    amendLibrary,
    type DocSummary
  } from '$lib/models/libraries';
  import type { Organization } from '$lib/models/organizations';
  import type { Profile } from '$lib/models/profiles';
  import type { Proposal } from '$lib/models/proposals';
  import { workingCallback } from '$lib/stores/working';
  import LibraryEditorDirectory from './LibraryEditorDirectory.svelte';
  import { emptyString } from '$lib/utils/string';
  import { format } from 'date-fns';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import DocEditor from './DocEditor.svelte';

  export let organization: Organization;
  export let group: Group;
  export let proposal: Proposal;
  export let profile: Profile;
  export let library: Library;

  let shelf: LibraryShelf;

  $: amendments = Object.values(proposal.amendments);
  $: amended = amendLibrary(library, amendments);
  $: shelf = organizeLibrary(amended);

  $: addDocName = '';
  $: addDocNameDisabled = true;
  $: addDocUnique = false;

  let originalDoc: null | DocSummary;
  $: originalDoc = null;

  let proposalDoc: null | DocSummary;
  $: proposalDoc = null;

  $: viewingDocName = $page.url.searchParams.get('doc_name');
  $: viewingDocId = $page.url.searchParams.get('doc_id');
  $: showDetails = false;

  function handleDetails(e: CustomEvent<boolean>) {
    showDetails = e.detail;
  }

  function loadDoc(docName: string) {
    const originalSummary = library.docs[docName];
    if (originalSummary) {
      originalDoc = originalSummary;
    } else {
      originalDoc = null;
    }
    const amendedSummary = amended.docs[docName];
    if (amendedSummary && amendedSummary?.path.includes('proposals')) {
      proposalDoc = amendedSummary;
    } else {
      proposalDoc = null;
    }
  }

  function validateDocName(e: Event) {
    const { value } = e.target as HTMLInputElement;
    if (emptyString(value)) {
      addDocNameDisabled = true;
      return;
    }
    let found = false;
    shelf.rows.forEach((v) => {
      const existing = v.find((d) => d.name == value);
      if (existing) {
        found = true;
        return;
      }
    });
    if (found) {
      addDocUnique = true;
      addDocNameDisabled = true;
    } else {
      addDocUnique = false;
      addDocNameDisabled = false;
    }
  }

  function docSearchParams(doc_name: string, doc_id: string) {
    $page.url.searchParams.set('doc_name', doc_name);
    $page.url.searchParams.set('doc_id', doc_id);
    console.log($page.url.searchParams.toString());
    return $page.url.searchParams.toString();
  }

  function teardown() {
    originalDoc = null;
    proposalDoc = null;
  }

  onMount(() => {
    if (viewingDocName) {
      loadDoc(viewingDocName);
    }

    return () => {
      teardown();
    };
  });

  afterNavigate(({ from, to }) => {
    const fromDoc = from?.url.searchParams.get('doc_name');
    const fromId = from?.url.searchParams.get('doc_id');
    const toDoc = to?.url.searchParams.get('doc_name');
    const toId = to?.url.searchParams.get('doc_id') ?? undefined;
    if (toDoc && (fromDoc !== toDoc || fromId !== toId)) {
      loadDoc(toDoc);
    } else if (!toDoc) {
      teardown();
    }
  });
</script>

<div class="flex flex-col sm:flex-row w-full gap-4">
  <div class="flex flex-col">
    {#if shelf}
      <div class="flex items-center mb-1 min-w-72 py-2 pl-4 pr-2">
        <div class="flex flex-col flex-1">
          <span class="flex-1 text-sm">
            {library.latest ? 'Latest' : 'Version: ' + format(library.created_at, 'yyyy/MM/dd p')}
          </span>
          <span class="flex-1 text-xs text-neutral">
            ({library.uid})
          </span>
        </div>
        <div class="dropdown dropdown-end">
          <div role="button" tabindex="0" class="btn btn-square btn-ghost btn-sm">
            <span class="material-symbols-outlined">post_add</span>
          </div>
          <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
          <div tabindex="0" class="dropdown-content p-4 z-[1] bg-base-200 rounded-box shadow">
            <form
              method="post"
              action="?/addDoc"
              class="flex flex-col gap-4"
              use:enhance={workingCallback({
                reset: true,
                invalidateAll: true
              })}
            >
              <input type="hidden" name="organization_id" value={organization.id} />
              <input type="hidden" name="group_id" value={group.id} />
              <input type="hidden" name="profile_handle" value={profile.handle} />
              <input
                type="text"
                name="name"
                autocomplete="off"
                placeholder="Name"
                class="input input-sm input-bordered"
                bind:value={addDocName}
                on:input={validateDocName}
              />
              {#if addDocUnique}
                <small class="text-error">New Doc names must be unique</small>
              {/if}
              <small class="text-neutral">
                Include dirnames if nesting a Doc, for example:
                <em>deeply/nested/Docname</em>
              </small>
              <button disabled={addDocNameDisabled} class="btn btn-sm btn-success">Create</button>
            </form>
          </div>
        </div>
      </div>
      <LibraryEditorDirectory dir="" {shelf} {amendments} {proposal} />
    {/if}
  </div>
  <div class="flex flex-col sm:flex-1 gap-2">
    {#if originalDoc || proposalDoc}
      <div role="tablist" class="tabs tabs-boxed flex flex-row w-full justify-start p-2 gap-2">
        {#if originalDoc}
          {#key originalDoc.id}
            <a
              href={`?${docSearchParams(originalDoc.name, originalDoc.id)}`}
              class="tab"
              class:tab-active={viewingDocId === originalDoc.id}
            >
              <span class="material-symbols-outlined text-base mr-1">article</span>
              Original
            </a>
          {/key}
        {/if}
        {#if proposalDoc}
          {#key proposalDoc.id}
            <a
              href={`?${docSearchParams(proposalDoc.name, proposalDoc.id)}`}
              class="tab"
              class:tab-active={viewingDocId === proposalDoc.id}
            >
              {#if profile.id === proposal.user_id}
                <span class="material-symbols-outlined text-base mr-1">edit_note</span>
              {/if}
              Proposal
            </a>
          {/key}
        {:else if originalDoc}
          <div class="flex-1" />
          <form
            method="post"
            action="?/editDoc"
            use:enhance={workingCallback({
              reset: false,
              invalidateAll: true
            })}
          >
            <input type="hidden" name="profile_handle" value={profile.handle} />
            <input type="hidden" name="proposal_path" value={proposal.path} />
            <input type="hidden" name="doc_path" value={originalDoc.path} />
            <button class="btn btn-sm btn-outline btn-success">
              <span class="material-symbols-outlined text-lg">edit</span>
              Edit
            </button>
          </form>
        {/if}
      </div>
    {/if}

    <div class:hidden={viewingDocId && viewingDocId !== originalDoc?.id}>
      {#if originalDoc}
        {#key originalDoc.id}
          <DocEditor
            editable={false}
            path={originalDoc.path}
            {showDetails}
            on:details={handleDetails}
          />
        {/key}
      {/if}
    </div>

    <div class:hidden={viewingDocId && viewingDocId !== proposalDoc?.id}>
      {#if proposalDoc}
        {#key proposalDoc.id}
          <DocEditor
            editable={proposal.state === 'draft' && profile.id === proposal.user_id}
            path={proposalDoc.path}
            {showDetails}
            on:details={handleDetails}
          />
        {/key}
      {/if}
    </div>
  </div>
</div>
