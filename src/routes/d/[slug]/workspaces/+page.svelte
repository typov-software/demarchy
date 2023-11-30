<script lang="ts">
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import { getRoleName } from '$lib/models/roles';
  import type { PageData } from './$types';

  export let data: PageData;

  let orgWorkspace = data.workspaces.find((ws) => ws.id === data.organization?.id);
  let groupSpaces = data.workspaces.filter((ws) => ws.id !== data.organization?.id);

  function getMembershipRole(wid: string) {
    const membership = data.memberships.find(
      (mem) => mem.organization_id === data.organization?.id
    );
    return getRoleName(membership!.roles[wid]);
  }
</script>

<BasicSection>
  <div class="flex flex-row w-full items-center">
    <h2 class="flex text-lg">Workspaces for {data.organization?.name}</h2>
    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost">Actions</div>
      <div class="dropdown-content z-[1] shadow bg-base-300">
        <ul class="menu p-0 w-60">
          <li><a href="{$page.url.pathname}/new">Create a new Workspace</a></li>
        </ul>
      </div>
    </div>
  </div>
  <ul class="w-full">
    {#if orgWorkspace}
      <li class="card bg-base-200">
        <div class="card-body">
          <h3 class="card-title">{orgWorkspace.name}</h3>
          <p>{orgWorkspace.description}</p>
        </div>
        <div class="card-actions justify-end items-center">
          <p class="flex-1 px-8">
            {getMembershipRole(orgWorkspace.id)}
          </p>
          <a href="/d/{data.slug}/workspaces/{orgWorkspace.id}" class="btn btn-primary">View</a>
        </div>
      </li>
    {/if}
    {#if groupSpaces.length}
      {#each groupSpaces as workspace}
        <li class="card bg-base-200">
          <div class="card-body">
            <h3 class="card-title">{workspace.name}</h3>
            <p>{workspace.description}</p>
          </div>
          <div class="card-actions justify-end">
            <a href="/d/{data.slug}/workspaces/{workspace.id}" class="btn btn-primary">View</a>
          </div>
        </li>
      {/each}
    {/if}
  </ul>
</BasicSection>

<div class="flex-1" />

<PageView />
