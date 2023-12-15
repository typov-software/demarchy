<script lang="ts">
  import { page } from '$app/stores';
  import { getRoleName } from '$lib/models/roles';
  import type { OrderByDirection } from 'firebase/firestore';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import { enhance } from '$app/forms';
  import { working } from '$lib/stores/working';
  import { user } from '$lib/firebase';
  import { titleCase } from '$lib/utils/string';

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
    await goto(`${$page.url.pathname}?${searchParams.toString()}`, { invalidateAll: true });
  }

  let groupsPath = `/d/${$page.params.slug}/groups`;
  let groupPath = `${groupsPath}/${data.group!.id}`;

  let context = data.group?.id === data.organization.id ? 'organization' : 'group';
  let numMembers = data.members.length ?? 0;
  let isOnlyMember = numMembers === 1 && data.members.at(0)?.id === $user?.uid;
</script>

<div class="text-sm breadcrumbs self-start py-4 px-4">
  <ul>
    <li><a href={groupsPath}>Groups</a></li>
    <li><a href={groupPath}>{data.group?.name}</a></li>
  </ul>
</div>

<BasicSection otherClass="py-0">
  <div class="flex flex-row w-full items-center">
    <h2 class="flex text-lg">Access to {data.group?.name}</h2>

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
          <li>
            <form
              class="flex justify-start text-left"
              method="post"
              action="?/leaveGroup"
              use:enhance={() => {
                const jobId = working.add();
                return async ({ update }) => {
                  working.remove(jobId);
                  update();
                };
              }}
            >
              <input type="hidden" name="context" value={context} />
              <input type="hidden" name="organization_id" value={data.organization.id} />
              <input type="hidden" name="group_id" value={data.group?.id} />
              <button
                disabled={isOnlyMember}
                class:cursor-not-allowed={isOnlyMember}
                class:text-slate-500={isOnlyMember}
                class="text-rose-500 w-full text-left">Leave {titleCase(context)}</button
              >
            </form>
          </li>
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
</BasicSection>
