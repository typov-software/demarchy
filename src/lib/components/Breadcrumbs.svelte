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
    access: {
      path: root + group?.id + '/access',
      symbol: 'key'
    },
    activity: {
      disabled: true,
      path: root + group?.id + '/activity',
      symbol: 'timeline'
    },
    discussions: {
      path: root + group?.id + '/discussions',
      symbol: 'forum'
    },
    docs: {
      path: root + group?.id + '/docs',
      symbol: 'article'
    },
    feedback: {
      path: root + group?.id + '/feedback',
      symbol: 'feedback'
    },
    invitations: {
      path: root + group?.id + '/invitations',
      symbol: 'person_add'
    },
    proposals: {
      path: root + group?.id + '/proposals',
      symbol: 'history_edu'
    },
    settings: {
      disabled: true,
      path: root + group?.id + '/settings',
      symbol: 'settings'
    }
  };
</script>

<div class="breadcrumbs p-0 w-full">
  <ul>
    {#if groups}
      <li class="dropdown dropdown-start dropdown-bottom dropdown-hover">
        {#if !group}
          <div role="button" tabindex="0" class="btn btn-sm btn-warning rounded-xl">
            Select group
          </div>
        {:else}
          <a role="button" tabindex="0" class="btn btn-sm btn-success rounded-xl" href={root}>
            {group.name}
          </a>
        {/if}
        <ul class="menu w-60 dropdown-content z-[1] shadow bg-base-300 rounded-box">
          {#each groups as g}
            <li>
              <a href={root + g.id + (matchedRoute ? `/${matchedRoute}` : '')} title={g.name}>
                {g.name}
              </a>
            </li>
          {/each}
        </ul>
      </li>
    {/if}

    {#if group}
      <li class="dropdown dropdown-start dropdown-bottom dropdown-hover">
        {#if matchedRoute}
          <a
            role="button"
            tabindex="0"
            class="btn btn-sm btn-ghost rounded-xl px-2"
            href={`${parts.slice(0, 5).join('/')}`}
          >
            <span class="material-symbols-outlined">{config[matchedRoute].symbol}</span>
            {titleCase(matchedRoute)}
          </a>
          <!-- <div role="button" tabindex="0" class="btn btn-sm btn-ghost rounded-xl">
            <span class="material-symbols-outlined">{config[matchedRoute].symbol}</span>
            {titleCase(matchedRoute)}
          </div> -->
        {:else}
          <div role="button" tabindex="0" class="btn btn-sm btn-warning rounded-xl">Go to</div>
        {/if}
        <ul class="menu w-47 dropdown-content z-[1] shadow bg-base-300 rounded-box left-3">
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
          {/each}
        </ul>
      </li>
      {#if parts.at(5)}
        <li>
          <a
            class="btn btn-sm btn-ghost text-neutral rounded-xl"
            href={`${parts.slice(0, 6).join('/')}`}
          >
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
