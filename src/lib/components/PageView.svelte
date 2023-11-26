<script lang="ts">
  import { page } from '$app/stores';
  import { app } from '$lib/firebase';
  import { onMount } from 'svelte';

  onMount(async () => {
    const { getAnalytics, logEvent } = await import('firebase/analytics');
    const page_path = $page.url.pathname;
    await logEvent(getAnalytics(app), 'page_view', {
      page_path
    });
    console.debug('[analytics]', { page_path });
  });
</script>
