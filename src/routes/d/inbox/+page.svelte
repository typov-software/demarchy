<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import NotificationCard from '$lib/components/NotificationCard.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<BasicSection>
  <ul>
    {#each data.notifications as notification}
      <NotificationCard {notification} />
    {/each}
  </ul>
</BasicSection>

<div class="flex-1" />
<PageView />
