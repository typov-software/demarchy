<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { Group } from '$lib/models/groups';
  import { titleCase } from '$lib/utils/string';

  export let group: Group;
  export let groups: Group[];

  $: groupId = group.id;
  $: groupsPath = `/d/${$page.params.slug}/groups`;
  $: groupPath = `${groupsPath}/${groupId}`;

  $: parts = $page.url.pathname.split('/');
  $: part = parts?.at(5);
  $: subroute = part ? part : 'access';

  $: subroutes = {
    access: `${groupPath}`,
    feedback: `${groupPath}/feedback`,
    invitations: `${groupPath}/invitations`,
    settings: `${groupPath}/settings`
  } as Record<string, string>;
</script>

<div class="breadcrumbs p-4 pb-0">
  <ul>
    <li><a href={groupsPath}>Groups</a></li>
    <li class="dropdown dropdown-start dropdown-bottom">
      <div tabindex="0" role="button">
        {group.name}
      </div>
      <ul class="menu w-60 dropdown-content z-[1] shadow bg-base-300 rounded-box">
        {#each groups as g}
          <li>
            <button
              title={g.name}
              on:click={() => {
                goto(`${groupsPath}/${g.id}`, {
                  invalidateAll: false
                });
              }}
            >
              {g.name}
            </button>
          </li>
        {/each}
      </ul>
    </li>
    {#if subroute}
      <li class="dropdown dropdown-start dropdown-bottom">
        <div tabindex="0" role="button">{titleCase(subroute)}</div>
        <ul class="menu w-60 dropdown-content z-[1] shadow bg-base-300 rounded-box">
          {#each Object.keys(subroutes) as route}
            <li>
              <a href={subroutes[route]} title={titleCase(route)}>
                {titleCase(route)}
              </a>
            </li>
          {/each}
        </ul>
      </li>
    {/if}
  </ul>
</div>

<style lang="scss">
  .breadcrumbs {
    overflow: unset;
  }
</style>
