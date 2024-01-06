<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import DocEditor from '../DocEditor.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<BasicSection>
  <Breadcrumbs organization={data.organization} groups={data.groups} group={data.group} />
  <DocEditor doc={data.doc} editable={false} expanded />
</BasicSection>

<PageView />
