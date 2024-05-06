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
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <div tabindex="0" class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
        <ul class="menu w-60">
          <li>
            <a href="/d/{$page.params.slug}/groups/new">
              <span class="material-symbols-outlined">add</span>
              Form a Group
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div class="card mb-4">
    <div class="card-body py-0 px-1.5 sm:max-w-4xl sm:self-center">
      <h2 class="card-title sm:text-2xl mb-2">Groups</h2>
      <p>
        These are the <strong class="text-success">Groups</strong> formed within your organization.
      </p>
      <p>
        Any organization member can view group resources, but only <strong class="text-purple-500"
          >Members</strong
        > of the group can participate in proposals, polls, and discussions.
      </p>
      <p>
        Load the <strong class="text-primary">Organization</strong> group to interact with all members.
      </p>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
    <div class="card bg-base-200 hover:bg-primary transition-colors">
      <a href={`/d/${$page.params.slug}/groups/new`} class="">
        <div class="card-body flex flex-col items-center justify-center">
          <span class="material-symbols-outlined">add</span>
          <span class="font-bold"> Form a Group </span>
        </div>
      </a>
    </div>
    {#each [orgGroup.id] as group_id (group_id)}
      <GroupCard group={orgGroup} organization={data.organization} memberships={data.memberships} />
    {/each}
    {#each orgGroups as group (group.id)}
      <GroupCard {group} organization={data.organization} memberships={data.memberships} />
    {/each}
  </div>
</BasicSection>
