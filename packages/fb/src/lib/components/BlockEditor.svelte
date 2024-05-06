<script lang="ts">
  import type { Block } from "$lib/models/blocks";
  import MarkdownTextarea from "$lib/components/MarkdownTextarea.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let index: number;
  export let block: Block;
  export let focus: boolean = false;
  export let editable = true;
  export let placeholder = "";
  $: placeholderText = placeholder;

  // export let onSaveBlock: (index: number, block: Block) => Promise<void>;
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

  function handleDragStart(e: DragEvent) {
    if (!editable) return;
    dragging = true;
    e.dataTransfer!.clearData();
    e.dataTransfer!.effectAllowed = "move";
    e.dataTransfer!.setData("text/plain", index.toString());
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
    const previous = Number(e.dataTransfer!.getData("text/plain"));
    if (previous === index) {
      return;
    }
    over = false;
    onSortBlock(previous, index);
  }
</script>

<div
  bind:this={dragSrcEl}
  id={block.uid}
  role="listitem"
  class="flex items-center focus-within:z-10 px-2 hover:bg-base-300"
  class:opacity-40={dragging}
  class:border-2={over}
  class:border-info={over}
  class:border-dashed={over}
  style:padding-top="0.4rem"
  draggable={!focused && editable}
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
  on:dragover={handleDragOver}
  on:dragenter={handleDragEnter}
  on:dragleave={handleDragLeave}
  on:drop={handleDragDrop}
>
  <div class="flex relative w-full">
    <MarkdownTextarea
      bind:value={content}
      requestFocus={focus}
      name="content"
      placeholder={placeholderText}
      {editable}
      on:blur={() => {
        placeholderText = placeholder;
        dispatch("blur", { index, content });
      }}
      on:focus={() => {
        placeholderText = `Empty ${block.type} block`;
        dispatch("focus", index);
      }}
      on:enter={() => {
        dispatch("enter", index);
      }}
      on:escape={() => {
        dispatch("escape", index);
      }}
      on:backspace={() => {
        dispatch("backspace", index);
      }}
      on:up={() => {
        dispatch("up", index - 1);
      }}
      on:down={() => {
        dispatch("up", index + 1);
      }}
    />

    {#if !focused && editable}
      <div class="dropdown dropdown-top dropdown-end">
        <div
          tabindex="0"
          role="button"
          class="options-btn btn btn-sm btn-square shadow-none rounded-lg h-auto absolute z-20 right-0 px-1 w-auto opacity-0"
          style:top="-0.2rem"
        >
          <span class="material-symbols-outlined text-neutral text-lg">drag_indicator</span>
        </div>
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <div tabindex="0" class="dropdown-content z-30 shadow bg-base-300">
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
  [draggable="true"]:hover .options-btn {
    opacity: 1;
  }
</style>
