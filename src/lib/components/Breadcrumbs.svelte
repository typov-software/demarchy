<script lang="ts">
  import { page } from '$app/stores';
  import type { Group } from '$lib/models/groups';
  import type { Organization } from '$lib/models/organizations';
  import { titleCase } from '$lib/utils/string';

  export let organization: Organization;
  export let groups: undefined | Group[];
  export let group: undefined | Group;

  $: root = `/d/${organization.slug}/`;
  $: parts = $page.url.pathname.split('/');
  $: matchedRoute = parts.at(4);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config: Record<string, any>;
  $: config = {
    // activity: {
    //   disabled: true,
    //   path: root + group?.slug + '/activity',
    //   symbol: 'timeline'
    // },
    docs: {
      path: root + group?.slug + '/docs',
      symbol: 'article'
    },
    feedback: {
      path: root + group?.slug + '/feedback',
      symbol: 'feedback'
    },
    discussions: {
      path: root + group?.slug + '/discussions',
      symbol: 'forum'
    },
    proposals: {
      path: root + group?.slug + '/proposals',
      symbol: 'history_edu',
      divider: true
    },
    access: {
      path: root + group?.slug + '/access',
      symbol: 'key'
    },
    settings: {
      disabled: true,
      path: root + group?.slug + '/settings',
      symbol: 'settings'
    }
  };
</script>

<div class="breadcrumbs p-0 w-full">
  <ul>
    {#if groups}
      <li class="dropdown dropdown-start dropdown-bottom">
        <div role="button" tabindex="0" class="btn btn-sm" class:btn-success={group}>
          {group ? group.name : 'Select group'}
        </div>
        <ul class="menu w-60 dropdown-content z-[1] shadow bg-base-300 rounded-box">
          <li>
            <a href={root} title="All groups" class="text-neutral hover:text-base-content">
              See all groups
            </a>
          </li>
          {#each groups as g (g.id)}
            <li>
              <a href={root + g.slug + (matchedRoute ? `/${matchedRoute}` : '')} title={g.name}>
                {g.name}
              </a>
            </li>
          {/each}
        </ul>
      </li>
    {/if}

    {#if group}
      <li class="dropdown dropdown-start dropdown-bottom">
        {#if matchedRoute}
          <div role="button" tabindex="0" class="btn btn-sm btn-ghost">
            <span class="material-symbols-outlined">{config[matchedRoute].symbol}</span>
            {titleCase(matchedRoute)}
          </div>
        {:else}
          <div role="button" tabindex="0" class="btn btn-sm btn-warning">Go to</div>
        {/if}
        <ul class="menu w-48 dropdown-content z-[1] shadow bg-base-300 rounded-box left-3">
          <li>
            <a
              href={root + group.slug}
              title="See group"
              class="text-neutral hover:text-base-content"
            >
              See group
            </a>
          </li>
          {#each Object.keys(config) as route}
            <li>
              <a
                href={config[route].path}
                title={titleCase(route)}
                aria-disabled={config[route].disabled}
                class:text-neutral={config[route].disabled}
                class:pointer-events-none={config[route].disabled}
              >
                <span class="material-symbols-outlined">{config[route].symbol}</span>
                {titleCase(route)}
              </a>
            </li>
            {#if config[route].divider}
              <li />
            {/if}
          {/each}
        </ul>
      </li>
      {#if parts.at(5)}
        <!-- breadcrumbs class may have precedence here -->
        <li class="!hidden sm:!flex">
          <a class="btn btn-sm btn-ghost text-neutral" href={`${parts.slice(0, 6).join('/')}`}>
            {titleCase(parts[5])}
          </a>
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
