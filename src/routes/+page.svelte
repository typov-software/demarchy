<script lang="ts">
  import DemarchyLogo from '$lib/components/DemarchyLogo.svelte';
</script>

<div class="hero min-h-screen bg-base-100 p-2">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 title="Demarchy">
        <DemarchyLogo width="100%" />
      </h1>
      <p class="py-6 max-w-sm">
        A democratic document editor for organizations, communities, and cooperatives.
      </p>
      <div class="flex flex-row gap-4 justify-center mt-2">
        <a href="/join" class="btn btn-secondary">
          <span class="material-symbols-outlined">join</span>
          Join now
        </a>
        <a href="/login" class="btn btn-primary">
          <span class="material-symbols-outlined">login</span>
          Login
        </a>
      </div>
    </div>
  </div>
</div>
