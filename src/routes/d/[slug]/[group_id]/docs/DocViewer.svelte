<script lang="ts">
  import type { Doc } from '$lib/models/docs';
  import { fade } from 'svelte/transition';
  import { format } from 'date-fns';
  import BlockViewer from './BlockViewer.svelte';
  import ProfileLink from '$lib/components/ProfileLink.svelte';

  export let doc: Doc;
</script>

<div class="w-full p-0" in:fade={{ duration: 200 }}>
  <div class="flex items-center text-xs px-4 py-2 mb-2 bg-base-300 gap-2">
    Created by <ProfileLink handle={doc.profile_handle} />
    on {format(doc.created_at, 'MMMM d, yyyy')}
  </div>
  {#each doc.blocks as block (block.uid)}
    <BlockViewer {block} />
  {/each}
</div>
