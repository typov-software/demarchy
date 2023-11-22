<script>
  import AppBar from '$lib/components/AppBar.svelte';
  import AuthCheck from '$lib/components/AuthCheck.svelte';
</script>

<AuthCheck>
  <main>
    <AppBar />

    <slot />
  </main>
</AuthCheck>
