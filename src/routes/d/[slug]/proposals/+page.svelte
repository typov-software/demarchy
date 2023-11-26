<script lang="ts">
  import PageView from '$lib/components/PageView.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<h2>Proposals</h2>

<PageView />
