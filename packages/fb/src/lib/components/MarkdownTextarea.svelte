<script lang="ts">
  import { autosize } from '$lib/stores/use-autosize';
  import SvelteMarkdown from 'svelte-markdown';
  import HtmlRenderer from './HtmlRenderer.svelte';
  import { afterUpdate, createEventDispatcher, onMount } from 'svelte';

  export let value: string;
  export let name: string;

  export let placeholder = 'placeholder';
  export let editable = true;
  export let requestFocus = false;

  const dispatch = createEventDispatcher();
  let element: HTMLTextAreaElement;

  $: focused = false;
  onMount(() => {
    if (requestFocus) {
      element?.focus();
    }
  });

  afterUpdate(() => {
    if (requestFocus && !focused) {
      element?.focus();
    }
  });

  async function handleBlur() {
    focused = false;
    dispatch('blur');
  }

  function handleFocus() {
    focused = true;
    dispatch('focus');
  }

  function handleKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Enter': {
        if (!e.shiftKey) {
          e.preventDefault();
          dispatch('enter');
          element.blur();
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        dispatch('escape');
        element.blur();
        break;
      }
      case 'Backspace': {
        // don't trim as we might be deleting spaces
        if ((e.target as HTMLTextAreaElement).value === '') {
          e.preventDefault();
          dispatch('backspace');
        }
        break;
      }
      case 'ArrowUp': {
        dispatch('up');
        break;
      }
      case 'ArrowDown': {
        dispatch('down');
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
    on:keydown={handleKeydown}
    use:autosize
    disabled={!editable}
    autocapitalize="off"
    autocomplete="off"
    class="markdown-textarea-input disabled:text-base-content"
    class:absolute={!focused}
    class:opacity-0={!focused}
    class:pointer-events-none={!editable}
    {name}
    {placeholder}
    rows={1}
  />
  {#if !focused}
    <button
      on:click={() => editable && element.focus()}
      class="markdown-textarea-focus-btn markdown-body"
      class:absolute={focused}
      class:opacity-50={!value.trim().length}
      class:pointer-events-none={!editable}
    >
      <SvelteMarkdown
        source={value.trim().length ? value : placeholder}
        options={{ breaks: true }}
        renderers={{
          html: HtmlRenderer,
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
