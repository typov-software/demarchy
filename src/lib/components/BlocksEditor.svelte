<script lang="ts">
  import type { Block } from '$lib/models/blocks';
  import { tick } from 'svelte';
  import BlockEditor from './BlockEditor.svelte';

  export let saveBlocks: undefined | ((blocks: Block[]) => Promise<void>) = undefined;
  export let editable = true;
  export let placeholder = '';
  export let blocks: Block[];
  $: blocks;

  let requestFocus: number | undefined;
  $: requestFocus = undefined;
  $: saving = false;

  function onRequestFocus(index: number) {
    if (blocks.at(index)) {
      requestFocus = index;
    }
  }

  function onAddBlock(index: number) {
    const nextBlocks = blocks.slice();
    requestFocus = index;
    nextBlocks.splice(index, 0, {
      uid: crypto.randomUUID(),
      content: '',
      type: 'text'
    });
    blocks = [...nextBlocks];
    // no need to save doc here, its just an empty block
    // and will commit when input loses focus
  }

  async function onDeleteBlock(index: number) {
    if (saving) return;
    saving = true;
    const nextBlocks = blocks.slice();
    nextBlocks.splice(index, 1);
    requestFocus = index - 1;
    blocks = [...nextBlocks];
    if (saveBlocks) {
      await saveBlocks(nextBlocks);
    }
    saving = false;
  }

  async function onSortBlock(from: number, to: number) {
    if (saving) return;
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
    if (saveBlocks) {
      await saveBlocks(nextBlocks);
    }
    saving = false;
  }

  async function saveBlock(index: number, block: Block) {
    if (saving) return;
    saving = true;
    const nextBlocks = blocks.slice();
    nextBlocks.splice(index, 1, block);
    blocks = nextBlocks.slice();
    if (saveBlocks) {
      await saveBlocks(nextBlocks);
    }
    saving = false;
  }
</script>

{#each blocks as block, index (block.uid)}
  <BlockEditor
    focus={requestFocus === index}
    placeholder={index === 0 ? placeholder : ''}
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
