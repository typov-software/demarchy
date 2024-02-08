<script lang="ts">
  import { toast } from '$lib/stores/toast';
  import SvelteMarkdown from 'svelte-markdown';
</script>

<div class="toast toast-bottom z-10 w-full sm:w-auto">
  {#each $toast as alert (alert.uid)}
    <div role="alert" class={`alert alert-${alert.level}`}>
      <span class="material-symbols-outlined" class:text-info={alert.level === 'neutral'}>
        {#if alert.level === 'success'}
          check_circle
        {:else if alert.level === 'warning'}
          warning
        {:else if alert.level === 'error'}
          error
        {:else}
          info
        {/if}
      </span>
      <div class="markdown-body">
        <SvelteMarkdown source={alert.content} />
      </div>
      <div>
        <button class="btn btn-square btn-sm btn-ghost" on:click={() => toast.remove(alert)}>
          <span class="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
</style>
