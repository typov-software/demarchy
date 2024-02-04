<script lang="ts">
  export let title: string;
  export let subtitle: string;
  export let reverse: boolean = false;
</script>

<div class="hero w-full min-h-screen p-2">
  <div
    class="hero-content flex-col w-full gap-8"
    class:lg:flex-row={!reverse}
    class:lg:flex-row-reverse={reverse}
  >
    <header class="flex flex-col w-full flex-1 items-center gap-6">
      <h2 class="text-4xl sm:text-5xl font-black font-prompt text-center uppercase">
        {title}
      </h2>
      <h3 class="text-xl sm:text-2xl text-center max-w-md">{subtitle}</h3>
    </header>

    <div class="card bg-base-200 flex-1">
      <div class="card-body sm:text-lg sm:max-w-xl">
        <slot />
      </div>
    </div>
  </div>
</div>
