<script lang="ts">
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import type { PageData } from './$types';
  import GroupRow from './GroupRow.svelte';

  export let data: PageData;

  let orgGroup = data.groups.find((ws) => ws.id === data.organization?.id);
  let groupSpaces = data.groups.filter((ws) => ws.id !== data.organization?.id);

  function getMembershipRole(wid: string) {
    const membership = data.memberships.find(
      (mem) => mem.organization_id === data.organization?.id
    );
    return membership!.roles[wid];
  }
</script>

<BasicSection>
  <div class="flex flex-row w-full items-center">
    <Breadcrumbs />
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
              Create a new Group
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Name</th>
        <th class="w-full">Description</th>
        <th>Access</th>
        <th />
      </tr>
    </thead>
    <tbody>
      {#if orgGroup}
        <GroupRow slug={data.slug} group={orgGroup} role={getMembershipRole(orgGroup.id)} />
      {/if}
      {#if groupSpaces.length}
        {#each groupSpaces as group}
          <GroupRow slug={data.slug} {group} role={getMembershipRole(group.id)} />
        {/each}
      {/if}
    </tbody>
  </table>
</BasicSection>

<div class="flex-1" />

<PageView />
