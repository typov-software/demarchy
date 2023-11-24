<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="flex-1" />

<section class="flex flex-col items-center">
  <ul class="w-full max-w-lg">
    {#each data.vouchers as voucher}
      <li class="card bg-base-200">
        <div class="card-body">
          {voucher.type}
        </div>
      </li>
    {/each}
  </ul>
</section>

<div class="flex-1" />
