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

  <div class="flex flex-wrap w-full gap-4">
    <div class="flex flex-col gap-6 border-2 border-base-200 p-6 rounded-box w-full">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl mb-2">Groups</h2>
        <p>
          These are the <strong class="text-accent">Groups</strong> formed within your organization.
        </p>
        <p>
          Any organization member can view group resources, but only <strong class="text-success"
            >Members</strong
          > of the group can participate in proposals, polls, and discussions.
        </p>
        <p>
          Load the <strong class="text-primary">Organization</strong> group to interact with all members.
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        <GroupCard
          group={orgGroup}
          organization={data.organization}
          memberships={data.memberships}
        />
        {#each orgGroups as group (group.id)}
          <GroupCard {group} organization={data.organization} memberships={data.memberships} />
        {/each}
      </div>
    </div>
  </div>
</BasicSection>
