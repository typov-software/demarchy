<script lang="ts">
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import type { PageData } from './$types';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import GroupCard from './GroupCard.svelte';

  export let data: PageData;
  $: orgGroup = data.groups.find((group) => group.id === data.organization.id)!;
  $: orgGroups = data.groups.filter((group) => group.id !== data.organization.id);
</script>

<BasicSection>
  <div class="flex flex-row w-full items-center">
    <Breadcrumbs organization={data.organization} groups={data.allowed_groups} group={undefined} />

    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-sm btn-square btn-primary">
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

  <div class="flex flex-wrap w-full gap-4 max-w-2xl">
    <GroupCard group={orgGroup} organization={data.organization} memberships={data.memberships} />

    {#each orgGroups as group (group.id)}
      <GroupCard {group} organization={data.organization} memberships={data.memberships} />
    {/each}
  </div>
</BasicSection>
