<script lang="ts">
  import type { Doc } from '$lib/models/docs';
  import { fade } from 'svelte/transition';
  import BlockEditor from './BlockEditor.svelte';
  import type { Block } from '$lib/models/blocks';
  import { doc as fdoc, updateDoc } from 'firebase/firestore';
  import { db, docStore } from '$lib/firebase';
  import { format } from 'date-fns';
  import './editor.scss';

  export let path: string;
  export let editable = true;

  let doc = docStore<Doc>(path);
  $: saving = false;

  let docName = $doc?.name;
  $: docName;

  let nameInput: HTMLInputElement;
  $: nameInput;

  let focused: number | undefined;
  $: focused = undefined;

  $: blocks = $doc?.blocks.slice() ?? [];

  async function onAddBlock(index: number) {
    if (!$doc || saving) return;
    saving = true;
    const nextBlocks = blocks.slice();
    focused = index;
    nextBlocks.splice(index, 0, {
      id: crypto.randomUUID(),
      content: '',
      type: 'text'
    });
    await updateDoc(fdoc(db, path), {
      blocks: nextBlocks
    });
    blocks = [...nextBlocks];
    saving = false;
  }

  async function onDeleteBlock(index: number) {
    const nextBlocks = blocks.slice();
    nextBlocks.splice(index, 1);
    blocks = [...nextBlocks];
    await updateDoc(fdoc(db, path), {
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
    await updateDoc(fdoc(db, path), {
      blocks: nextBlocks
    });
  }

  async function onSaveBlock(index: number, block: Block) {
    const nextBlocks = blocks.slice();
    nextBlocks.splice(index, 1, block);
    blocks = nextBlocks.slice();
    await updateDoc(fdoc(db, path), {
      blocks
    });
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
