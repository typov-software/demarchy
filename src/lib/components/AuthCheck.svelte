<script lang="ts">
  import { user } from '$lib/firebase';
  import BasicSection from './BasicSection.svelte';
  import DemarchyLogo from './DemarchyLogo.svelte';
</script>

{#if $user}
  <slot />
{:else}
  <BasicSection otherClass="min-h-screen h-full hero justify-center">
    <div class="hero-content flex-col p-8">
      <DemarchyLogo />
      <p class="pb-2">You must be logged in to view this page.</p>
      <a class="btn btn-primary" href="/login">
        <span class="material-symbols-outlined">login</span>
        Login
      </a>
    </div>
  </BasicSection>
{/if}
