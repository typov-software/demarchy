<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import NotificationCard from '$lib/components/NotificationCard.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<BasicSection>
  <ul class="w-full max-w-xl">
    {#each data.notifications as notification}
      <NotificationCard {notification} />
    {/each}
  </ul>
</BasicSection>
