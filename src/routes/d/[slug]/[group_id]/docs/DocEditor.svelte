<script lang="ts">
  import type { Doc } from '$lib/models/docs';
  import { fade } from 'svelte/transition';
  import BlockEditor from './BlockEditor.svelte';
  import type { Block } from '$lib/models/blocks';
  import { doc as fdoc, updateDoc } from 'firebase/firestore';
  import { db, docStore } from '$lib/firebase';
  import { format } from 'date-fns';
  import './editor.scss';
  import { tick } from 'svelte';

  export let path: string;
  export let editable = true;

  let doc = docStore<Doc>(path);
  $: saving = false;

  let docName = $doc?.name;
  $: docName;

  let nameInput: HTMLInputElement;
  $: nameInput;

  let requestFocus: number | undefined;
  $: requestFocus = undefined;

  $: blocks = $doc?.blocks.slice() ?? [];

  function onRequestFocus(index: number) {
    if (blocks.at(index)) {
      requestFocus = index;
    }
  }

  function onAddBlock(index: number) {
    const nextBlocks = blocks.slice();
    requestFocus = index;
    nextBlocks.splice(index, 0, {
      id: crypto.randomUUID(),
      content: '',
      type: 'text'
    });
    blocks = [...nextBlocks];
    // no need to save doc here, its just an empty block
    // and will commit when input loses focus
  }

  async function onDeleteBlock(index: number) {
    if (!$doc || saving) return;
    saving = true;
    const nextBlocks = blocks.slice();
    nextBlocks.splice(index, 1);
    requestFocus = index - 1;
    blocks = [...nextBlocks];
    await updateDoc(fdoc(db, path), {
      blocks: nextBlocks
    });
    saving = false;
  }

  async function onSortBlock(from: number, to: number) {
    if (!$doc || saving) return;
    saving = true;
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
    await updateDoc(fdoc(db, path), {
      blocks: nextBlocks
    });
    saving = false;
  }

  async function saveBlock(index: number, block: Block) {
    if (!$doc || saving) return;
    saving = true;
    const nextBlocks = blocks.slice();
    nextBlocks.splice(index, 1, block);
    blocks = nextBlocks.slice();
    await updateDoc(fdoc(db, path), {
      blocks
    });
    saving = false;
  }
</script>

{#if $doc}
  <div class="w-full p-0" in:fade={{ duration: 200 }}>
    <div class="flex items-center text-xs px-4 py-2 mb-2 bg-base-300 gap-2">
      Created by <a href={`/d/profiles/${$doc.user_handle}`} class="link link-success"
        >@{$doc.user_handle}</a
      >
      on {format($doc.created_at, 'MMMM d, yyyy')}
    </div>
    {#each blocks as block, index (block.id)}
      <BlockEditor
        focus={requestFocus === index}
        {index}
        {block}
        {editable}
        {onDeleteBlock}
        {onSortBlock}
        on:blur={async (e) => {
          await tick();
          requestFocus = undefined;
          saveBlock(e.detail.index, {
            ...block,
            content: e.detail.content
          });
        }}
        on:enter={(e) => {
          onAddBlock(e.detail + 1);
        }}
        on:backspace={(e) => {
          onDeleteBlock(e.detail);
        }}
        on:up={(e) => onRequestFocus(e.detail)}
        on:down={(e) => onRequestFocus(e.detail)}
      />
    {/each}
  </div>
{/if}
