<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import type { LayoutData } from './$types';
  import { useOrganization } from '$lib/stores/organization';

  export let data: LayoutData;

  /**
   * Take the loaded organization and
   */
  let organization = useOrganization();
  onMount(() => {
    organization.set(data.organization);
    return () => {
      organization.set(undefined);
    };
  });
</script>

<nav class="flex flex-row flex-wrap px-2">
  <a href="/d/{data.slug}" class:active={$page.url.pathname.endsWith(data.slug)} title="Activity">
    <span class="material-symbols-outlined">timeline</span>
    Activity
  </a>

  <a
    href="/d/{data.slug}/discussions"
    class:active={$page.route.id?.match(/discussions/g)}
    title="Discussions"
  >
    <span class="material-symbols-outlined">forum</span>
    Discussions
  </a>

  <a
    href="/d/{data.slug}/proposals"
    class:active={$page.route.id?.match(/proposals/g)}
    title="Proposals"
  >
    <span class="material-symbols-outlined">history_edu</span>
    Proposals
  </a>

  <a
    href="/d/{data.slug}/libraries"
    class:active={$page.route.id?.match(/libraries/g)}
    title="Libraries"
  >
    <span class="material-symbols-outlined">library_books</span>
    Libraries
  </a>

  <a href="/d/{data.slug}/groups" class:active={$page.route.id?.match(/groups/g)} title="Groups">
    <span class="material-symbols-outlined">groups</span>
    Groups
  </a>
</nav>

<slot />

<style lang="scss">
  nav {
    border-bottom: 1px solid oklch(var(--b2));
  }

  nav a {
    @apply flex;
    @apply items-center;
    @apply gap-x-1;
    @apply p-2;
    border-bottom-width: 2px;
    border-bottom-style: solid;
    border-bottom-color: transparent;
    transition: border-bottom-color 150ms;

    &.active {
      @apply font-bold;
      border-bottom-color: oklch(var(--a));
    }

    &:hover {
      border-bottom-color: oklch(var(--p));
    }
  }
</style>
