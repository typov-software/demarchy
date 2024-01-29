<script lang="ts">
  import DemarchyLogo from '$lib/components/DemarchyLogo.svelte';
</script>

<div class="hero min-h-screen bg-base-100">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 title="Demarchy">
        <DemarchyLogo width="100%" />
      </h1>
      <p class="py-6">A democratic document editor for organizations and communities.</p>
      <div class="flex flex-row gap-4 justify-center">
        <a href="/join" class="btn btn-secondary">Join now</a>
        <a href="/login" class="btn btn-primary">Login</a>
      </div>
    </div>
  </div>
</div>
