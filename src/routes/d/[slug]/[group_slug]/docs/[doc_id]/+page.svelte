<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import DocCard from '../DocCard.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<BasicSection>
  <Breadcrumbs organization={data.organization} groups={data.allowed_groups} group={data.group} />
  <DocCard doc={data.doc} />
</BasicSection>
