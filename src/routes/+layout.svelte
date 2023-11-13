<script lang="ts">
  import { applyStoredTheme } from '$lib/stores/themes';
  import '../app.css';

  if (typeof window !== 'undefined') {
    applyStoredTheme();
  }
</script>

<svelte:head>
  <title>Demarchy</title>
</svelte:head>

<slot />
