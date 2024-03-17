<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { Organization } from '$lib/models/organizations';
  import { useOrganization } from '$lib/stores/organization';
  import DemarchyLogo from './DemarchyLogo.svelte';

  export let organizations: Organization[] = [];
  let organization = useOrganization();

  function closeDrawer() {
    const node = document.querySelector('[for="app-nav"].drawer-overlay');
    node?.dispatchEvent(new MouseEvent('click'));
  }

  async function loadOrganization(slug: string) {
    closeDrawer();
    organization.set(organizations.find((o) => o.slug === slug));
    await goto(`/d/${slug}`, { invalidateAll: true });
  }

  function handleClickOrganization(slug: string) {
    return () => loadOrganization(slug);
  }
</script>

<div class="drawer w-auto">
  <input id="app-nav" type="checkbox" class="drawer-toggle" />

  <div class="drawer-content">
    <label for="app-nav" class="btn btn-square btn-md drawer-button" title="App Menu">
      <span class="material-symbols-outlined">menu</span>
    </label>
  </div>

  <div class="drawer-side">
    <label for="app-nav" aria-label="close sidebar" class="drawer-overlay" />

    <div class="min-h-full bg-base-100 text-base-content flex flex-col">
      <div class="flex flex-row items-center justify-between p-3">
        <button class="btn btn-square" on:click={closeDrawer}>
          <span class="material-symbols-outlined">close</span>
        </button>

        <a href="/d" title="Dashboard">
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.36011 26.64V5.04001H22.3201V9.36001H26.6401V22.32H22.3201V26.64H9.36011ZM13.6801 22.32H22.1473V9.36001H13.6801V22.32Z"
              class="fill-secondary"
            />
            <path
              d="M9.36011 30.96V9.36001H22.3201V13.68H26.6401V26.64H22.3201V30.96H9.36011ZM13.6801 26.64H22.1473V13.68H13.6801V26.64Z"
              class="fill-primary"
            />
          </svg>
        </a>
      </div>

      <ul class="menu p-0">
        <li>
          <a href="/d" on:click={closeDrawer} class="rounded-none" title="Dashboard">
            <span class="material-symbols-outlined">dashboard</span>
            Dashboard
          </a>
        </li>
        <li>
          <a href="/d/proposals" on:click={closeDrawer} class="rounded-none" title="Proposals">
            <span class="material-symbols-outlined">history_edu</span>
            Proposals
          </a>
        </li>
        <li>
          <a href="/d/discussions" on:click={closeDrawer} class="rounded-none">
            <span class="material-symbols-outlined">forum</span>
            Discussions
          </a>
        </li>
      </ul>

      <div class="divider" />
      <ul class="menu p-0">
        {#each organizations as organization (organization.id)}
          <li>
            <a
              href="/d/{organization.slug}"
              on:click={handleClickOrganization(organization.slug)}
              class="rounded-none"
              class:text-accent={$page.params.slug === organization.slug}
              class:font-semibold={$page.params.slug === organization.slug}
            >
              {organization.name}
            </a>
          </li>
        {/each}
      </ul>

      <div class="flex flex-1" />
      <div class="divider" />

      <ul class="menu p-0">
        <li>
          <a
            href="/documentation"
            on:click={closeDrawer}
            class="rounded-none"
            title="Documentation"
          >
            <span class="material-symbols-outlined">local_library</span>
            Docs
          </a>
        </li>
        <li>
          <a href="/feedback" on:click={closeDrawer} class="rounded-none" title="Give feedback">
            <span class="material-symbols-outlined">add_comment</span>
            Give feedback
          </a>
        </li>
      </ul>

      <footer class="flex flex-row items-center py-5 ml-4">
        <a href="/">
          <DemarchyLogo width={127} />
        </a>

        <p class="text-sm ml-2 mt-1">&copy; 2023 Typov LLC</p>
      </footer>
    </div>
  </div>
</div>

<style lang="scss">
  .drawer-side > div {
    width: 360px;
  }

  .divider {
    opacity: 0.25;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
</style>
