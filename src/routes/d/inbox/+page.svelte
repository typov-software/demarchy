<script lang="ts">
  import NotificationCard from '$lib/components/NotificationCard.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<section class="flex flex-col items-center py-6 px-4 gap-8">
  <ul>
    {#each data.notifications as notification}
      <NotificationCard {notification} />
    {/each}
  </ul>
</section>

<div class="flex-1" />
<PageView />
