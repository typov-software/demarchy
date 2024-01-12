<script lang="ts">
  import type { Block } from '$lib/models/blocks';
  import SvelteMarkdown from 'svelte-markdown';
  import HtmlRenderer from '$lib/components/HtmlRenderer.svelte';

  export let block: Block;
</script>

<div
  id={block.id}
  role="listitem"
  class="flex items-center focus-within:z-10 px-2 hover:bg-base-300"
  style:padding-top="0.4rem"
>
  <div class="flex relative w-full min-h-8 h-full px-2 py-0 pb-2 text-left font-noto z-0">
    <SvelteMarkdown
      source={block.content}
      options={{ breaks: true }}
      renderers={{
        html: HtmlRenderer
      }}
    />
  </div>
</div>
