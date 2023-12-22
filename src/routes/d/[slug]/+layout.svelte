<script lang="ts">
  import { onMount } from 'svelte';
  import type { LayoutData } from './$types';
  import { useOrganization } from '$lib/stores/organization';

  export let data: LayoutData;

  /**
   * Take the loaded organization and
   */
  let organization = useOrganization();
  onMount(() => {
    organization.set(data.organization);
    return () => {
      organization.set(undefined);
    };
  });
</script>

<slot />
