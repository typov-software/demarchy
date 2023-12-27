<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  $: proposal = data.proposal;

  $: {
    console.log({ proposal });
  }
</script>
