<script lang="ts">
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import type { PageData } from './$types';
  import WorkspaceRow from './WorkspaceRow.svelte';

  export let data: PageData;

  let orgWorkspace = data.workspaces.find((ws) => ws.id === data.organization?.id);
  let groupSpaces = data.workspaces.filter((ws) => ws.id !== data.organization?.id);

  function getMembershipRole(wid: string) {
    const membership = data.memberships.find(
      (mem) => mem.organization_id === data.organization?.id
    );
    return membership!.roles[wid];
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
      {#if orgWorkspace}
        <WorkspaceRow
          slug={data.slug}
          workspace={orgWorkspace}
          role={getMembershipRole(orgWorkspace.id)}
        />
      {/if}
      {#if groupSpaces.length}
        {#each groupSpaces as workspace}
          <WorkspaceRow slug={data.slug} {workspace} role={getMembershipRole(workspace.id)} />
        {/each}
      {/if}
    </tbody>
  </table>
</BasicSection>

<div class="flex-1" />

<PageView />
