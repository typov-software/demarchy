<script lang="ts">
  import { db } from '$lib/firebase';
  import { HANDLES } from '$lib/models/firestore';
  import { checkValidHandle } from '$lib/utils/string';
  import { doc, getDoc } from 'firebase/firestore';

  export let currentHandle: string;
  let handle = currentHandle;
  let loading = false;
  let isAvailable = false;
  let debounceTimer: NodeJS.Timeout;

  $: handle;
  $: isValid = checkValidHandle(handle);
  $: isTouched = handle.length > 0;
  $: isTaken = isValid && !isAvailable && !loading;
  $: isChanged = currentHandle !== handle;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function checkHandleAvailability(e: any) {
    handle = e.target.value.toLowerCase();
    isAvailable = false;
    clearTimeout(debounceTimer);
    loading = true;
    debounceTimer = setTimeout(async () => {
      const ref = doc(db, HANDLES, handle.toLowerCase());
      const exists = await getDoc(ref).then((doc) => doc.exists());
      isAvailable = !exists;
      loading = false;
    }, 500);
  }
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-end gap-4 w-full">
    <div class="flex flex-col flex-1 items-start justify-end">
      <label for="handle">Handle</label>
      <input
        type="text"
        id="handle"
        name="handle"
        value={handle}
        autocomplete="off"
        class="input input-bordered w-full"
        on:input={checkHandleAvailability}
        class:input-error={!isValid && isTouched}
        class:input-warning={isTaken && isChanged}
        class:input-success={isAvailable && isValid && !loading && isTouched && isChanged}
      />
    </div>
    <button
      type="submit"
      class="btn btn-primary"
      disabled={!isAvailable || loading || !isValid || !isTouched || !isChanged}
    >
      Save
    </button>
  </div>
  <div class="w-full text-left">
    {#if loading}
      <p class="text-secondary text-sm">Checking availability of @{handle}...</p>
    {/if}

    {#if !isValid && isTouched}
      <p class="text-error text-sm">must be 3-32 characters long, alphanumeric only</p>
    {/if}

    {#if isValid && !isAvailable && !loading && isChanged}
      <p class="text-warning text-sm">
        @{handle} is not available
      </p>
    {/if}

    {#if !loading && !isChanged}
      <p class="text-accent text-sm">
        @{handle} is your handle, rejoice!
      </p>
    {/if}
  </div>
</div>
