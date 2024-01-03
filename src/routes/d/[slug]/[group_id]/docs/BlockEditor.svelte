<script lang="ts">
  import SvelteMarkdown from 'svelte-markdown';
  import type { Block } from '$lib/models/blocks';
  import { autosize } from '$lib/stores/use-autosize';
  import { afterUpdate } from 'svelte';
  import HtmlRenderer from '$lib/components/HtmlRenderer.svelte';

  export let index: number;
  export let block: Block;
  export let focus: boolean = false;

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
  $: placeholder = `Empty ${block.type} block`;
  $: focused = false;
  $: hasUnfocused = false;
  $: saving = false;

  afterUpdate(() => {
    if (focused) return;
    if (focus && !focused && !hasUnfocused) {
      textareaEl?.focus();
    }
  });

  function onKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Enter': {
        if (!e.shiftKey) {
          console.log('add block');
          textareaEl?.blur();
          onAddBlock(index + 1);
          e.preventDefault();
        }
        break;
      }
      case 'Escape': {
        textareaEl?.blur();
        break;
      }
    }
  }

  function onDragStart(e: DragEvent) {
    dragging = true;
    e.dataTransfer!.clearData();
    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('text/plain', index.toString());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onDragEnd(e: DragEvent) {
    dragging = false;
    over = false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onDragOver(e: DragEvent) {
    e.preventDefault();
    over = true;
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onDragEnter(e: DragEvent) {
    over = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onDragLeave(e: DragEvent) {
    over = false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onDragDrop(e: DragEvent) {
    const previous = Number(e.dataTransfer!.getData('text/plain'));
    if (previous === index) {
      return;
    }
    over = false;
    onSortBlock(previous, index);
  }

  async function saveBlock() {
    if (saving || content === block.content) return;
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
  draggable={!focused}
  on:dragstart={onDragStart}
  on:dragend={onDragEnd}
  on:dragover={onDragOver}
  on:dragenter={onDragEnter}
  on:dragleave={onDragLeave}
  on:drop={onDragDrop}
>
  <div class="input-container">
    <div class="input-wrap" class:absolute={!focused}>
      <textarea
        class="input-textarea"
        class:opacity-0={!focused}
        bind:this={textareaEl}
        autocapitalize="off"
        autocomplete="off"
        rows={1}
        {placeholder}
        disabled={saving}
        on:focus={() => {
          placeholder = '';
          focused = true;
        }}
        on:blur={() => {
          placeholder = `Empty ${block.type} block`;
          focused = false;
          hasUnfocused = true;
          saveBlock();
        }}
        use:autosize
        bind:value={content}
        on:keydown={onKeydown}
      ></textarea>
    </div>
    {#if !focused}
      <button
        on:click={() => textareaEl?.focus()}
        class="focus-input-btn markdown-body"
        class:absolute={focused}
      >
        <SvelteMarkdown
          source={content}
          options={{ breaks: true }}
          renderers={{
            html: HtmlRenderer
          }}
        />
      </button>
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

  .input-wrap {
    @apply w-full;
  }

  .input-textarea {
    @apply textarea text-sm leading-6;
    @apply px-2 py-0;
    @apply min-h-0 w-full;
    @apply bg-base-200;
    @apply rounded-none;
  }

  .focus-input-btn {
    @apply px-2 py-0 pb-2;
    @apply w-full min-h-8 h-full;
    @apply text-left;
    @apply relative z-10;
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
