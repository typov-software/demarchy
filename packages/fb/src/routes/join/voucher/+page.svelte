<script lang="ts">
  import { enhance } from '$app/forms';
  import AuthCheck from '$lib/components/AuthCheck.svelte';
  import { joinVoucher } from '$lib/firebase';
  import { workingCallback } from '$lib/stores/working';

  $: voucherId = '';
  $: redeeming = false;
</script>

<AuthCheck inline back="/join">
  <div class="flex flex-col w-full items-start gap-4">
    {#if !$joinVoucher?.redeemed}
      <p class="text-left">An unredeemed voucher is required to join.</p>
      <form
        class="w-full flex flex-col sm:flex-row items-start sm:items-end gap-4"
        method="post"
        action="?/redeem"
        use:enhance={workingCallback({
          reset: true,
          invalidateAll: true,
          onStart() {
            redeeming = true;
          },
          onEnd() {
            redeeming = false;
          },
        })}
      >
        <div class="flex flex-col items-start w-full gap-2">
          <label for="voucher_id" class="text-sm text-neutral">Voucher</label>
          <input
            class="input input-bordered w-full"
            type="text"
            name="voucher_id"
            id="voucher_id"
            placeholder="Code"
            bind:value={voucherId}
          />
        </div>
        <button disabled={redeeming} class="btn btn-success w-full sm:w-auto mt-2">Redeem</button>
      </form>
    {:else}
      <p class="text-left">You've been vouched for &mdash; continue to complete your profile.</p>
    {/if}
  </div>

  {#if $joinVoucher?.redeemed}
    <a href="/join/handle" class="btn btn-success self-end mt-4">
      Choose your handle
      <span class="material-symbols-outlined">navigate_next</span>
    </a>
  {/if}
</AuthCheck>
