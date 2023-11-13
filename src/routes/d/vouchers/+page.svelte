<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<BasicSection>
  <ul class="w-full max-w-lg">
    {#each data.vouchers as voucher}
      <li class="card bg-base-200">
        <div class="card-body">
          <div class="flex items-center">
            <p>
              {voucher.type}
              ({voucher.id})
            </p>
            {#if !voucher.redeemed}
              <a href={voucher.type} class="btn btn-primary">Use</a>
            {:else}
              <button disabled class="btn btn-primary">Used</button>
            {/if}
          </div>
        </div>
      </li>
    {/each}
  </ul>
</BasicSection>

<div class="flex-1" />
<PageView />
