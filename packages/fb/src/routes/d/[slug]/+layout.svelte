<script lang="ts">
  import { beforeUpdate, onMount } from "svelte";
  import type { LayoutData } from "./$types";
  import { useOrganization } from "$lib/stores/organization";

  export let data: LayoutData;

  let organization = useOrganization();

  $: updateOrg = () => {
    if ($organization?.id !== data.organization.id) {
      organization.set(data.organization);
    }
  };

  beforeUpdate(() => {
    updateOrg();
  });

  onMount(() => {
    return () => {
      organization.set(undefined);
    };
  });
</script>

<slot />
