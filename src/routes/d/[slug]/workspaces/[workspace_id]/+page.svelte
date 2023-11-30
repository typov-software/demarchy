<script lang="ts">
  import { page } from '$app/stores';
  import { getRoleName } from '$lib/models/roles';
  import type { OrderByDirection } from 'firebase/firestore';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';

  export let data: PageData;

  function onSort(field: string, direction: OrderByDirection) {
    return async () => {
      await setSort(field, direction);
    };
  }

  async function setSort(field: string, direction: OrderByDirection) {
    const searchParams = $page.url.searchParams;
    searchParams.set('sortBy', field);
    searchParams.set('direction', direction);
    await goto(`${$page.url.pathname}?${searchParams.toString()}`);
  }

  let workspacesPath = `/d/${$page.params.slug}/workspaces`;
  let workspacePath = `${workspacesPath}/${data.workspace!.id}`;
</script>

<div class="text-sm breadcrumbs self-start py-4 px-4">
  <ul>
    <li><a href={workspacesPath}>Workspaces</a></li>
    <li><a href={workspacePath}>{data.workspace?.name}</a></li>
  </ul>
</div>

<section class="flex flex-col items-center px-4 gap-8">
  <div class="flex flex-row w-full items-center">
    <h2 class="flex text-lg">Access to {data.workspace?.name}</h2>

    <div class="flex flex-1" />

    <div class="dropdown dropdown-end mr-2">
      <div tabindex="0" role="button" class="btn btn-ghost">Sort</div>
      <div class="dropdown-content z-[1] shadow bg-base-300">
        <ul class="menu p-0 w-60">
          <li><button on:click={onSort('name', 'asc')}>Name ASC</button></li>
          <li><button on:click={onSort('name', 'desc')}>Name DESC</button></li>
          <li><button on:click={onSort('handle', 'asc')}>Handle ASC</button></li>
          <li><button on:click={onSort('handle', 'desc')}>Handle DESC</button></li>
          <li><button on:click={onSort('role', 'asc')}>Role ASC</button></li>
          <li><button on:click={onSort('role', 'desc')}>Role DESC</button></li>
        </ul>
      </div>
    </div>

    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost">Actions</div>
      <div class="dropdown-content z-[1] shadow bg-base-300">
        <ul class="menu p-0 w-60">
          <li><a href="{$page.url.pathname}/invitations?modal=invite">Invite someone</a></li>
        </ul>
      </div>
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Handle</th>
        <th>Role</th>
      </tr>
    </thead>
    <tbody>
      {#each data.members as member}
        <tr>
          <td>{member.name}</td>
          <td>@{member.handle}</td>
          <td>{getRoleName(member.role)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>
