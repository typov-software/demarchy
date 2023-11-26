<script lang="ts">
  import AppBar from '$lib/components/AppBar.svelte';
  import AuthCheck from '$lib/components/AuthCheck.svelte';
  import DemarchyLogo from '$lib/components/DemarchyLogo.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<AuthCheck>
  <main class="flex flex-col h-full">
    <AppBar organizations={data.organizations} profile={data.profile} />

    <slot />

    <div class="flex-1" />
    <div class="divider" />
    <footer class="flex md:flex-row flex-col justify-around items-center py-5 ml-4 mb-3">
      <div class="flex flex-row items-center">
        <DemarchyLogo width={127} />
        <p class="text-sm ml-2 mt-1">
          &copy; 2023
          <a
            href="https://typov.com"
            target="_blank"
            rel="noopener noreferrer"
            class="link link-hover"
          >
            Typov LLC
          </a>
        </p>
      </div>

      <ul class="flex flex-row flex-wrap justify-center gap-x-2 text-sm text-primary">
        <li>
          <a href="/terms" class="link-hover">Terms</a>
        </li>
        <li>
          <a href="/privacy" class="link-hover">Privacy</a>
        </li>
        <li>
          <a href="/security" class="link-hover">Security</a>
        </li>
        <li>
          <a href="/documentation" class="link-hover">Documentation</a>
        </li>
        <li>
          <a href="/pricing" class="link-hover">Pricing</a>
        </li>
        <li>
          <a href="/about" class="link-hover">About</a>
        </li>
      </ul>
    </footer>
  </main>
</AuthCheck>

<style lang="scss">
  main {
    min-height: 100vh;
  }

  .divider {
    opacity: 0.25;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
</style>
