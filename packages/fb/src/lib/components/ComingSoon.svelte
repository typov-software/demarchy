<script lang="ts">
  import HeroCanvas from "../../routes/HeroCanvas.svelte";
  export let canvas: boolean;
  export let title: string;
</script>

{#if canvas}
  <HeroCanvas />
{/if}

<div class="hero min-h-screen">
  <div class="hero-content">
    <div class="max-w-xl flex flex-col items-center gap-2">
      <h1 class="text-3xl font-bold font-prompt">{title}</h1>
      <p>Coming soon</p>
    </div>
  </div>
</div>
