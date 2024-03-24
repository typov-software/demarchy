<script lang="ts">
  import { user } from "$lib/firebase";
  import BasicSection from "./BasicSection.svelte";
  import DemarchyLogo from "./DemarchyLogo.svelte";

  export let inline = false;
  export let back = "/login";
  export let condition = true;
</script>

{#if $user && condition}
  <slot />
{:else}
  <BasicSection otherClass={`h-full hero justify-center ${inline ? "" : "min-h-screen"}`}>
    <div class="hero-content flex-col p-8">
      {#if !inline}
        <DemarchyLogo />
      {/if}
      <p class="pb-2">You must be logged in to view this</p>
      <a class="btn btn-primary" href={back}>
        <span class="material-symbols-outlined">login</span>
        Login
      </a>
    </div>
  </BasicSection>
{/if}
