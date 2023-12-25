<script lang="ts">
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import GroupTable from './GroupTable.svelte';
  import type { PageData } from './$types';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

  export let data: PageData;
</script>

<BasicSection>
  <div class="flex flex-row w-full items-center">
    <Breadcrumbs organization={data.organization} groups={data.groups} group={undefined} />

    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-sm btn-square btn-primary rounded-xl">
        <span class="material-symbols-outlined">more_vert</span>
      </div>
      <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
        <ul class="menu w-60">
          <li>
            <a href="/d/{$page.params.slug}/groups/new">
              <span class="material-symbols-outlined">add</span>
              Create a new Group
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <GroupTable
    memberships={data.memberships}
    organization={data.organization}
    groups={data.groups}
  />
</BasicSection>

<div class="flex-1" />

<PageView />
