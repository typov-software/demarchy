<script lang="ts">
  import AppBar from '$lib/components/AppBar.svelte';
  import AuthCheck from '$lib/components/AuthCheck.svelte';
  import { working } from '$lib/stores/working';
  import { derived, type Readable } from 'svelte/store';
  import type { PageData } from './$types';
  import { useOrganization } from '$lib/stores/organization';
  import DemarchyFooter from '$lib/components/DemarchyFooter.svelte';

  export let data: PageData;

  const loading: Readable<boolean> = derived(working, ($working, set) => {
    if ($working.length) {
      set(true);
    } else {
      set(false);
    }
  });

  let organization = useOrganization();
</script>

<AuthCheck>
  <main class="flex flex-col h-full">
    <AppBar
      organization={$organization}
      organizations={data.organizations}
      profile={data.profile}
      loading={$loading}
    />

    <slot />

    <div class="flex-1" />

    <DemarchyFooter />
  </main>
</AuthCheck>

<style lang="scss">
  main {
    min-height: 100vh;
  }
</style>
