<script lang="ts">
  import { fly } from "svelte/transition";
  import { page } from "$app/stores";
</script>

{#key $page.url}
  <div in:fly={{ y: "10px" }}>
    <slot />
  </div>
{/key}
