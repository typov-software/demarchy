<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<section class="flex flex-col items-center my-4">
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
</section>
