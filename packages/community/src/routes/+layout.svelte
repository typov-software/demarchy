<script lang="ts">
  import '../app.scss';
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { applyStoredTheme } from '$lib/stores/themes';

  if (typeof window !== 'undefined') {
    applyStoredTheme();
  }

  export let data;

  let { supabase, session } = data;
  $: ({ supabase, session } = data);

  onMount(() => {
    const { data } = supabase.auth.onAuthStateChange((event, _session) => {
      if (_session?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth');
      }
    });

    return () => data.subscription.unsubscribe();
  });
</script>

<svelte:head>
  <title>Demarchy</title>
</svelte:head>

<slot />
