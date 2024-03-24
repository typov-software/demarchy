<script lang="ts">
  import AppBar from "$lib/components/AppBar.svelte";
  import AuthCheck from "$lib/components/AuthCheck.svelte";
  import { working } from "$lib/stores/working";
  import { derived, type Readable } from "svelte/store";
  import type { PageData } from "./$types";
  import { useOrganization } from "$lib/stores/organization";
  import DemarchyFooter from "$lib/components/DemarchyFooter.svelte";
  import { profile } from "$lib/firebase";
  import { navigating } from "$app/stores";
  import HeroCanvas from "../HeroCanvas.svelte";
  import { fly } from "svelte/transition";

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

{#if $navigating}
  <HeroCanvas />
{/if}

<AuthCheck condition={$profile !== null}>
  <main class="flex flex-col h-full min-h-screen">
    <AppBar
      organization={$organization}
      organizations={data.organizations}
      profile={data.profile}
      loading={$loading}
    />

    <slot />

    <div class="flex-1" />

    <DemarchyFooter />
  </main>
</AuthCheck>

{#if $navigating}
  <div
    class="flex flex-col items-center justify-center fixed w-full h-full z-50 top-0 left-0"
    in:fly={{ delay: 100, duration: 150, opacity: 0 }}
  >
    <div class="absolute bg-base-100 opacity-50 w-full h-full top-0 left-0" />
    <p class="relative" in:fly={{ delay: 1500 }}>
      Loading the <span class="d-anim-text-walk">next</span> thing
    </p>
    <p class="relative" in:fly={{ delay: 5000 }}>Patience is a virtue</p>
    <p class="relative" in:fly={{ delay: 7500 }}>And you're clearly virtuous</p>
    <p class="relative" in:fly={{ delay: 10_000 }}>...</p>
    <p class="relative" in:fly={{ delay: 20_000 }}>Ok maybe we broke something please reload</p>
  </div>
{/if}
