<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<BasicSection otherClass="w-full items-stretch">
  <div class="flex flex-col md:max-w-4xl md:self-center gap-4 w-full">
    <h2 class="text-xl">Your Vouchers</h2>
    <ul class="w-full max-w-lg gap-4 flex flex-col self-center">
      {#each data.vouchers as voucher (voucher.id)}
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
  </div>
</BasicSection>
