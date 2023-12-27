<script lang="ts">
  import type { Proposal } from '$lib/models/proposals';
  import { autosize } from '$lib/stores/use-autosize';
  import SvelteMarkdown from 'svelte-markdown';

  export let proposal: Proposal | undefined = undefined;

  $: title = proposal?.title ?? '';
  $: description = proposal?.description ?? '';

  $: viewRaw = true;
</script>

<form method="post" class="card bg-base-200 max-w-4xl w-full rounded-lg">
  <div class="card-body p-8 gap-4">
    <input
      bind:value={title}
      type="text"
      id="title"
      name="title"
      class="input bg-base-300"
      class:input-success={title.trim().length > 0}
      placeholder="Proposal Title"
    />
    {#if viewRaw}
      <textarea
        use:autosize
        class="textarea bg-base-300"
        class:textarea-success={description.trim().length > 0}
        name="description"
        id="description"
        placeholder="Describe the intentions and changes of this proposal"
        rows={3}
        autocomplete="off"
        bind:value={description}
      ></textarea>
    {:else}
      <div class="comment-body p-4 bg-base-300 rounded-xl">
        <input type="hidden" id="description" name="description" value={description} />
        <SvelteMarkdown source={description} />
      </div>
    {/if}

    <div class="flex flex-1 gap-2">
      <button
        class="btn btn-xs text-xs"
        class:btn-error={viewRaw}
        on:click={(e) => {
          e.preventDefault();
          viewRaw = true;
        }}>Raw</button
      >
      <button
        class="btn btn-xs text-xs"
        disabled={!description.trim().length}
        class:btn-success={!viewRaw}
        on:click={(e) => {
          e.preventDefault();
          viewRaw = false;
        }}>Formatted</button
      >
    </div>
    <div class="card-actions">
      <div class="flex-1" />
      <button class="btn rounded-xl" disabled>
        <span class="material-symbols-outlined">draft</span>
        Create draft
      </button>
    </div>
  </div>
</form>
