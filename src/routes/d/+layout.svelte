<script lang="ts">
  import AppBar from '$lib/components/AppBar.svelte';
  import AuthCheck from '$lib/components/AuthCheck.svelte';
  import DemarchyLogo from '$lib/components/DemarchyLogo.svelte';
  import { working } from '$lib/stores/working';
  import { derived, type Readable } from 'svelte/store';
  import type { PageData } from './$types';
  import { useOrganization } from '$lib/stores/organization';

  export let data: PageData;

  const loading: Readable<boolean> = derived(working, ($working, set) => {
    if ($working.length) {
      set(true);
    } else {
      set(false);
    }
  });

  let organization = useOrganization();
</script>

<AuthCheck>
  <main class="flex flex-col h-full">
    <AppBar
      organization={$organization}
      organizations={data.organizations}
      profile={data.profile}
      loading={$loading}
    />

    <slot />

    <footer
      class="footer flex md:flex-row flex-col justify-around items-center py-8 text-neutral gap-0"
    >
      <aside class="flex flex-row items-center">
        <DemarchyLogo width={127} />
        <p class="text-sm ml-2 mt-1">
          &copy; 2023
          <a
            href="https://typov.com"
            target="_blank"
            rel="noopener noreferrer"
            class="link link-hover"
          >
            typov LLC
          </a>
        </p>
      </aside>
      <nav class="flex flex-row flex-wrap items-center justify-center gap-x-2 text-sm mt-1">
        <a href="/terms" title="Terms" class="link-hover">Terms</a>
        <a href="/privacy" title="Privacy" class="link-hover">Privacy</a>
        <a href="/security" title="Security" class="link-hover">Security</a>
        <a href="/documentation" title="Documentation" class="link-hover">Documentation</a>
        <a href="/pricing" title="Pricing" class="link-hover">Pricing</a>
        <a href="/about" title="About" class="link-hover">About</a>
      </nav>
    </footer>
  </main>
</AuthCheck>

<style lang="scss">
  main {
    min-height: 100vh;
  }
  footer {
    border-top: 1px solid oklch(var(--b2));

    a:hover {
      @apply text-base-content;
      @apply transition-all;
    }
  }
</style>
