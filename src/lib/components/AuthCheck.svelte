<script lang="ts">
  import { user } from '$lib/firebase';
  import BasicSection from './BasicSection.svelte';
</script>

{#if $user}
  <slot />
{:else}
  <BasicSection otherClass="min-h-screen h-full hero justify-center">
    <div class="hero-content bg-base-200 p-8">
      <p class="text-error flex flex-col items-center gap-4">
        You must be signed in to view this page.
        <a class="btn btn-primary" href="/login">Sign in</a>
      </p>
    </div>
  </BasicSection>
{/if}
