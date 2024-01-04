<script lang="ts">
  import { autosize } from '$lib/stores/use-autosize';
  import SvelteMarkdown from 'svelte-markdown';
  import HtmlRenderer from './HtmlRenderer.svelte';

  export let value: string;
  export let inputName: string;
  export let placeholder = 'placeholder';
  export let onSave: () => Promise<void>;
  export let onFocusChange: undefined | ((focused: boolean) => void) = undefined;
  export let onEnter: undefined | (() => void) = undefined;

  let element: HTMLTextAreaElement;

  $: focused = false;

  async function handleBlur() {
    focused = false;
    if (onFocusChange) onFocusChange(focused);
    await onSave();
  }

  function handleFocus() {
    focused = true;
    if (onFocusChange) onFocusChange(focused);
  }

  function onKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Enter': {
        if (!e.shiftKey) {
          e.preventDefault();
          element.blur();
          if (onEnter) onEnter();
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        element.blur();
        break;
      }
      default:
        break;
    }
  }
</script>

<div class="markdown-textarea">
  <textarea
    bind:value
    bind:this={element}
    on:blur={handleBlur}
    on:focus={handleFocus}
    on:keydown={onKeydown}
    use:autosize
    autocapitalize="off"
    autocomplete="off"
    class="markdown-textarea-input"
    class:absolute={!focused}
    class:opacity-0={!focused}
    name={inputName}
    {placeholder}
    rows={1}
  />
  {#if !focused}
    <button
      on:click={() => element.focus()}
      class="markdown-textarea-focus-btn markdown-body"
      class:absolute={focused}
      class:opacity-50={!value.trim().length}
    >
      <SvelteMarkdown
        source={value.trim().length ? value : placeholder}
        options={{ breaks: true }}
        renderers={{
          html: HtmlRenderer
        }}
      />
    </button>
  {/if}
</div>

<style lang="scss">
  .markdown-textarea {
    @apply relative;
    @apply w-full;

    .markdown-textarea-input {
      @apply textarea text-sm leading-6;
      @apply px-2 py-0;
      @apply min-h-0 w-full;
      @apply bg-base-200;
      @apply rounded-none;
    }

    .markdown-textarea-focus-btn {
      @apply px-2 py-0 pb-2;
      @apply w-full min-h-8 h-full;
      @apply text-left;
      @apply relative z-0;
    }
  }
</style>
