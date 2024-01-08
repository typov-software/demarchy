<script lang="ts">
  import type { Doc } from '$lib/models/docs';
  import type { Amendment } from '$lib/models/proposals';
  import { fade } from 'svelte/transition';
  import BlockEditor from './BlockEditor.svelte';
  import type { Block } from '$lib/models/blocks';
  import { doc as fdoc, updateDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { format } from 'date-fns';
  import './editor.scss';

  export let doc: Doc;
  export let amendment: undefined | Amendment = undefined;
  export let editable = true;

  let docName = doc.name;
  $: docName;
  $: saving = false;
  let nameInput: HTMLInputElement;
  $: nameInput;

  export let expanded = false;
  $: expanded;

  let focused: number | undefined;
  $: focused = undefined;

  let blocks: Block[] = doc.blocks.slice();
  $: blocks;

  function onAddBlock(index: number) {
    const nextBlocks = blocks.slice();
    focused = index;
    nextBlocks.splice(index, 0, {
      id: crypto.randomUUID(),
      content: '',
      type: 'text'
    });
    blocks = [...nextBlocks];
  }

  async function onDeleteBlock(index: number) {
    const nextBlocks = blocks.slice();
    nextBlocks.splice(index, 1);
    blocks = [...nextBlocks];
    await updateDoc(fdoc(db, doc.path), {
      blocks: nextBlocks
    });
  }

  async function onSortBlock(from: number, to: number) {
    const nextBlocks = blocks.slice();
    if (to > from) {
      if (to > nextBlocks.length - 1) {
        to = nextBlocks.length;
      }
      // insert at new index, remove at old index
      nextBlocks.splice(to + 1, 0, blocks[from]);
      nextBlocks.splice(from, 1);
    } else if (to < from) {
      if (to < 0) {
        to = 0;
      }
      // remove at old index, insert at new index
      nextBlocks.splice(from, 1);
      nextBlocks.splice(to, 0, blocks[from]);
    }
    blocks = [...nextBlocks];
    await updateDoc(fdoc(db, doc.path), {
      blocks: nextBlocks
    });
  }

  async function onSaveBlock(index: number, block: Block) {
    const nextBlocks = blocks.slice();
    nextBlocks.splice(index, 1, block);
    blocks = nextBlocks.slice();
    await updateDoc(fdoc(db, doc.path), {
      blocks
    });
  }

  async function saveDocName() {
    if (saving || docName === doc.name) return;
    saving = true;
    await updateDoc(fdoc(db, doc.path), {
      name: docName
    });
    saving = false;
  }
</script>

<div class="card bg-base-200 max-w-4xl w-full rounded-lg">
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

    {#if expanded}
      <div class="p-0" in:fade={{ duration: 200 }}>
        <div class="flex items-center text-xs px-4 py-2 mb-2 bg-base-300 gap-2">
          Created by <a href={`/d/profiles/${doc.user_handle}`} class="link link-success"
            >@{doc.user_handle}</a
          >
          on {format(doc.created_at, 'MMM dd, yyyy')}
        </div>
        {#each blocks as block, index (block.id)}
          <BlockEditor
            {index}
            {block}
            {onAddBlock}
            {onSaveBlock}
            {onDeleteBlock}
            {onSortBlock}
            focus={focused === index}
            {editable}
          />
        {/each}
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
