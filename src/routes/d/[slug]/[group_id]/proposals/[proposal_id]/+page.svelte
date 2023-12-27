<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import ProposalForm from '../ProposalForm.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  $: proposal = data.proposal;

  $: {
    console.log({ proposal });
  }
</script>

<BasicSection>
  <ProposalForm {proposal} />
</BasicSection>

<PageView />
