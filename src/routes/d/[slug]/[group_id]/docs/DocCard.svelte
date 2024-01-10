<script lang="ts">
  import type { Doc } from '$lib/models/docs';
  import DocViewer from './DocViewer.svelte';

  export let doc: Doc;
</script>

<div class="card bg-base-200 max-w-4xl w-full rounded-lg">
  <div class="card-body gap-0 p-0 pb-4">
    <h3 class="card-title text-sm w-full items-center flex pl-4">
      <span class="material-symbols-outlined">article</span>
      <span class="pl-1 doc-name">
        {doc.name}
      </span>
      <div class="flex-1" />
      <button class="more-button btn btn-square shadow-none bg-base-200 rounded-lg flex">
        <span class="material-symbols-outlined"> more_vert </span>
      </button>
    </h3>
    <DocViewer {doc} />
  </div>
</div>

<style lang="scss">
  .doc-name {
    border-left: 1px solid transparent;
  }
  .more-button {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
</style>
