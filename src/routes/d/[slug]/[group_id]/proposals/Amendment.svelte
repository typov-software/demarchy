<script lang="ts">
  import { db } from '$lib/firebase';
  import type { Amendment, Proposal } from '$lib/models/proposals';
  import { doc as fdoc, writeBatch } from 'firebase/firestore';
  import DocEditor from '../docs/DocEditor.svelte';

  export let editable = true;
  export let amendment: Amendment;
  export let proposal: Proposal;
  export let docsRoute: string;
  $: expanded = true;
  $: saving = false;

  let nameInput: HTMLInputElement;
  $: nameInput;

  let docName = amendment.doc_name;
  $: docName;

  async function saveDocName() {
    if (saving || docName === amendment.doc_name) return;
    saving = true;
    const batch = writeBatch(db);
    batch.update(fdoc(db, amendment.doc_path), {
      name: docName
    });
    batch.update(fdoc(db, proposal.path), {
      amendments: {
        ...proposal.amendments,
        [amendment.doc_id]: {
          ...amendment,
          doc_name: docName
        }
      }
    });
    await batch.commit();
    saving = false;
  }
</script>

<div class="card bg-base-200 max-w-3xl w-full rounded-lg">
  <div class="card-body gap-0 p-0" class:pb-4={expanded}>
    <h3 class="card-title text-sm w-full items-center flex pl-4">
      {#if amendment}
        <span class="material-symbols-outlined">
          {#if amendment.type === 'create'}
            post_add
          {:else if amendment.type === 'update'}
            edit_note
          {:else if amendment.type === 'destroy'}
            delete
          {/if}
        </span>
      {/if}
      {#if expanded && editable}
        <input
          bind:this={nameInput}
          bind:value={docName}
          on:blur={() => {
            saveDocName();
          }}
          on:keypress={(e) => {
            if (e.key === 'Enter') {
              nameInput?.blur();
            }
          }}
          autocomplete="off"
          type="text"
          name="doc-name"
          class="input input-sm rounded-sm pl-1 bg-base-200 w-full"
          class:input-error={docName.trim().length === 0}
        />
      {:else}
        <span class="pl-1 doc-name">
          {docName}
        </span>
      {/if}
      <div class="flex-1" />
      {#if amendment}
        <span
          class="text-xs rounded-full py-1 px-2"
          class:bg-success={amendment.type === 'create'}
          class:bg-warning={amendment.type === 'update'}
          class:bg-error={amendment.type === 'destroy'}
        >
          {amendment.type}
        </span>
      {/if}
      <button
        class="expand-button btn btn-square shadow-none bg-base-200 rounded-lg flex"
        class:expanded
        on:click={() => (expanded = !expanded)}
      >
        <span class="material-symbols-outlined">
          {expanded ? 'expand_less' : 'expand_more'}
        </span>
      </button>
    </h3>

    {#if expanded && (amendment.type === 'create' || amendment.type === 'update')}
      <DocEditor path={amendment.doc_path} {editable} />
    {/if}

    {#if expanded && amendment.type === 'destroy'}
      <div class="px-4">
        <a
          href={`${docsRoute}/${amendment.doc_id}`}
          class="link link-hover hover:link-info"
          target="_blank"
          rel="noopener noreferrer"
        >
          See latest doc
          <span class="material-symbols-outlined text-base">open_in_new</span>
        </a>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .doc-name {
    border-left: 1px solid transparent;
  }
  .expand-button {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    &.expanded {
      border-bottom-right-radius: 0;
    }
  }
</style>
