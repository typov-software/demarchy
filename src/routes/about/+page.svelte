<script>
  import PageView from '$lib/components/PageView.svelte';
  import { user } from '$lib/firebase';
</script>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold">About</h1>
      <p class="py-4 pt-6">
        Demarchy is a democratic document editor for organizations and communities.
      </p>
      <p class="py-4">
        Modern real-time document libraries are missing the tools for equitable, transparent, and
        aligned decisions.
      </p>
      <p class="py-4 pb-6">
        We're building a document editor with democracy as a core user experience instead of just a
        value.
      </p>
      {#if $user}
        <a href="/d" class="btn btn-primary">Go to dashboard</a>
      {:else}
        <a href="/join" class="btn btn-primary">Join</a>
      {/if}
    </div>
  </div>
</div>

<PageView />
