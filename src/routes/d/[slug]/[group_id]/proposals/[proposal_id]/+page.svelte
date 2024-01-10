<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import ProposalEditor from '../ProposalEditor.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<BasicSection>
  <Breadcrumbs organization={data.organization} groups={data.groups} group={data.group} />
  <ProposalEditor
    organization={data.organization}
    group={data.group}
    profile={data.profile}
    proposal={data.proposal}
  />
</BasicSection>

<PageView />
