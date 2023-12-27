<script lang="ts">
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import type { PageData } from './$types';
  import ProposalForm from '../ProposalForm.svelte';

  export let data: PageData;
</script>

<BasicSection>
  <div class="flex flex-row w-full items-center">
    <Breadcrumbs organization={data.organization} groups={data.groups} group={data.group} />
    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-sm btn-square btn-primary rounded-xl">
        <span class="material-symbols-outlined">more_vert</span>
      </div>
      <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
        <ul class="menu w-60">
          <li>
            <a href="{$page.url.pathname}/new">
              <span class="material-symbols-outlined">add</span>
              New Proposal
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <ProposalForm />
</BasicSection>

<PageView />
