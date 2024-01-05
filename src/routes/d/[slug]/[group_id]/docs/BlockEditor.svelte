<script lang="ts">
  import type { Block } from '$lib/models/blocks';
  import { afterUpdate } from 'svelte';
  import MarkdownTextarea from '$lib/components/MarkdownTextarea.svelte';

  export let index: number;
  export let block: Block;
  export let focus: boolean = false;
  export let editable = true;

  export let onAddBlock: (afterIndex: number) => void;
  export let onSaveBlock: (index: number, block: Block) => Promise<void>;
  export let onDeleteBlock: (index: number) => Promise<void>;
  export let onSortBlock: (index: number, newIndex: number) => Promise<void>;

  let dragSrcEl: HTMLDivElement;

  let textareaEl: HTMLTextAreaElement;
  $: textareaEl;

  let content: string = block.content;
  $: content;

  $: dragging = false;
  $: over = false;
  $: focused = false;
  $: hasUnfocused = false;
  $: saving = false;

  afterUpdate(() => {
    if (focused) return;
    if (focus && !focused && !hasUnfocused) {
      textareaEl?.focus();
    }
  });

  function handleDragStart(e: DragEvent) {
    if (!editable) return;
    dragging = true;
    e.dataTransfer!.clearData();
    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('text/plain', index.toString());
  }

  function handleDragEnd() {
    dragging = false;
    over = false;
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    over = true;
    return false;
  }

  function handleDragEnter() {
    over = true;
  }

  function handleDragLeave() {
    over = false;
  }

  function handleDragDrop(e: DragEvent) {
    if (!editable) return;
    const previous = Number(e.dataTransfer!.getData('text/plain'));
    if (previous === index) {
      return;
    }
    over = false;
    onSortBlock(previous, index);
  }

  async function saveBlock() {
    if (saving || content === block.content || !editable) return;
    saving = true;
    await onSaveBlock(index, {
      ...block,
      content: content ?? ''
    });
    saving = false;
  }
</script>

<div
  bind:this={dragSrcEl}
  id={block.id}
  role="listitem"
  class="block-editor flex items-center focus-within:z-10"
  class:opacity-40={dragging}
  class:over
  draggable={!focused && editable}
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
  on:dragover={handleDragOver}
  on:dragenter={handleDragEnter}
  on:dragleave={handleDragLeave}
  on:drop={handleDragDrop}
>
  <div class="input-container">
    <MarkdownTextarea
      {editable}
      inputName="content"
      bind:value={content}
      placeholder={focused ? `Empty ${block.type} block` : ''}
      onSave={() => saveBlock()}
      onFocusChange={(f) => (focused = f)}
      onEnter={() => onAddBlock(index + 1)}
    />

    {#if !focused && editable}
      <div class="dropdown dropdown-top dropdown-end">
        <button class="options-btn">
          <span class="material-symbols-outlined">drag_indicator</span>
        </button>
        <div class="dropdown-content z-30 shadow bg-base-300">
          <ul class="menu menu-sm px-0 w-80">
            <li>
              <button
                class="rounded-none btn btn-sm btn-error justify-start flex"
                on:click={() => onDeleteBlock(index)}
              >
                <span class="material-symbols-outlined">delete</span>
                Delete block
              </button>
            </li>
            <li>
              <button
                class="rounded-none btn btn-sm justify-start flex"
                on:click={() => {
                  onSortBlock(index, index - 1);
                }}
              >
                <span class="material-symbols-outlined">arrow_upward</span>
                Move block up
              </button>
            </li>
            <li>
              <button
                class="rounded-none btn btn-sm justify-start flex"
                on:click={() => {
                  onSortBlock(index, index + 1);
                }}
              >
                <span class="material-symbols-outlined">arrow_downward</span>
                Move block down
              </button>
            </li>
          </ul>
        </div>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .block-editor {
    @apply flex;
    @apply px-2;
    padding-top: 0.4rem;

    &:hover {
      @apply bg-base-300;
    }

    &.over {
      @apply border-2 border-info border-dashed;
    }
  }

  .input-container {
    @apply flex relative w-full;
  }

  .options-btn {
    @apply btn btn-sm btn-square;
    @apply shadow-none rounded-lg;
    @apply h-auto;
    @apply absolute z-20 right-0;
    @apply px-1 w-auto;
    top: -0.2rem;
    opacity: 0;

    span {
      @apply text-neutral text-lg;
    }
  }

  [draggable='true'] {
    &:hover {
      .options-btn {
        opacity: 1;
      }
    }
  }
</style>
