<script lang="ts">
  import { page } from '$app/stores';
  import DemarchyFooter from '$lib/components/DemarchyFooter.svelte';
  import { applyStoredTheme } from '$lib/stores/themes';
  import '../app.scss';

  if (typeof window !== 'undefined') {
    applyStoredTheme();
  }

  $: renderFooter = [
    '/',
    '/about',
    '/documentation',
    '/join',
    '/login',
    '/pricing',
    '/privacy',
    '/security',
    '/terms'
  ].includes($page.route.id ?? '');
</script>

<svelte:head>
  <title>Demarchy</title>
</svelte:head>

<slot />

{#if renderFooter}
  <DemarchyFooter />
{/if}
