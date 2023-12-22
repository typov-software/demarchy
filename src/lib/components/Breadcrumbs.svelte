<script lang="ts">
  import { page } from '$app/stores';
  import type { Group } from '$lib/models/groups';
  import { titleCase } from '$lib/utils/string';

  export let group: Group | undefined = undefined;
  export let groups: Group[] | undefined = undefined;

  $: orgPath = `/d/${$page.params.slug}`;

  $: parts = $page.url.pathname.split('/');
  $: orgPart = parts?.at(3) ?? 'activity';
  $: subPart = parts?.at(5);

  $: groupId = group?.id;
  $: groupName = group?.name;
  $: groupsPath = `${orgPath}/groups`;
  $: groupPath = `${groupsPath}/${groupId}`;

  $: config = {
    activity: {
      symbol: 'timeline',
      path: orgPath + '/activity',
      subroutes: {}
    },
    discussions: {
      symbol: 'forum',
      path: orgPath + '/discussions',
      subroutes: {}
    },
    groups: {
      symbol: 'groups',
      path: orgPath + '/groups',
      subroutes: {
        access: {
          path: groupPath + '/access',
          symbol: 'key'
        },
        feedback: {
          path: groupPath + '/feedback',
          symbol: 'feedback'
        },
        invitations: {
          path: groupPath + '/invitations',
          symbol: 'person_add'
        },
        settings: {
          path: groupPath + '/settings',
          symbol: 'settings'
        }
      }
    },
    libraries: {
      symbol: 'library_books',
      path: orgPath + '/libraries',
      subroutes: {}
    },
    proposals: {
      symbol: 'history_edu',
      path: orgPath + '/proposals',
      subroutes: {}
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  $: crumbConfig = config[orgPart] ?? {};
</script>

<div class="breadcrumbs p-0">
  <ul>
    {#if subPart}
      <li>
        <a
          href={crumbConfig.path}
          title={titleCase(orgPart ?? '')}
          class="border-b-2 border-neutral text-neutral !no-underline hover:border-primary hover:text-base-content transition-all"
        >
          <span class="material-symbols-outlined mr-2">{crumbConfig.symbol}</span>
          {titleCase(orgPart ?? '')}
        </a>
      </li>
    {:else}
      <li class="dropdown dropdown-start dropdown-bottom dropdown-hover">
        <a
          href={crumbConfig.path}
          title={titleCase(orgPart ?? '')}
          class="border-b-2 border-neutral !no-underline hover:border-primary hover:text-base-content transition-all"
        >
          <span class="material-symbols-outlined mr-2">{crumbConfig.symbol}</span>
          {titleCase(orgPart ?? '')}
        </a>
        <ul class="menu w-60 dropdown-content z-[1] shadow bg-base-300 rounded-box">
          {#each Object.keys(config) as key}
            <li>
              <a href={config[key].path} title={titleCase(key)}>
                <span class="material-symbols-outlined">{config[key].symbol}</span>
                {titleCase(key)}
              </a>
            </li>
          {/each}
        </ul>
      </li>
    {/if}

    {#if group && groups}
      <li class="dropdown dropdown-start dropdown-bottom dropdown-hover">
        <div tabindex="0" role="button" class="flex items-center">
          {groupName}
        </div>
        <ul class="menu w-60 dropdown-content z-[1] shadow bg-base-300 rounded-box">
          {#each groups as g}
            <li>
              <a href={groupsPath + '/' + g.id + (subPart ? `/${subPart}` : '')} title={g.name}>
                {g.name}
              </a>
            </li>
          {/each}
        </ul>
      </li>

      {#if subPart}
        <li class="dropdown dropdown-start dropdown-bottom dropdown-hover">
          <div tabindex="0" role="button" class="flex items-center">
            <span class="material-symbols-outlined mr-2">
              {crumbConfig.subroutes[subPart].symbol}
            </span>
            {titleCase(subPart)}
          </div>
          <ul class="menu w-60 dropdown-content z-[1] shadow bg-base-300 rounded-box">
            {#each Object.keys(crumbConfig.subroutes) as route}
              <li>
                <a href={crumbConfig.subroutes[route].path} title={titleCase(route)}>
                  <span class="material-symbols-outlined">
                    {crumbConfig.subroutes[route].symbol}
                  </span>
                  {titleCase(route)}
                </a>
              </li>
            {/each}
          </ul>
        </li>
      {/if}
    {/if}
  </ul>
</div>

<style lang="scss">
  .breadcrumbs {
    overflow: unset;
  }
</style>
