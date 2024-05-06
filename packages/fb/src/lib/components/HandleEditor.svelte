<script lang="ts">
  import { db } from "$lib/firebase";
  import { HANDLES } from "$lib/models/firestore";
  import { checkValidHandle, emptyString } from "$lib/utils/string";
  import { doc, getDoc } from "firebase/firestore";
  import ProfileLink from "./ProfileLink.svelte";
  import { working } from "$lib/stores/working";

  export let showLoading = true;
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
  $: disabled =
    $working.length > 0 || !isAvailable || loading || !isValid || !isTouched || !isChanged;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function checkHandleAvailability(e: any) {
    handle = e.target.value.toLowerCase();
    isAvailable = false;
    clearTimeout(debounceTimer);
    loading = true;
    debounceTimer = setTimeout(async () => {
      if (emptyString(handle)) {
        isAvailable = false;
        loading = false;
        return;
      }
      const ref = doc(db, HANDLES, handle.toLowerCase());
      const exists = await getDoc(ref).then((doc) => doc.exists());
      isAvailable = !exists;
      loading = false;
    }, 500);
  }
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-end gap-4 w-full">
    <div class="flex flex-col flex-1 items-start justify-end gap-2">
      <label for="handle" class="text-sm text-neutral">Handle</label>
      <div class="w-full relative">
        <span
          class="absolute flex justify-center items-center w-8 h-full pointer-events-none text-neutral"
          >@</span
        >
        <input
          type="text"
          id="handle"
          name="handle"
          value={handle}
          autocomplete="off"
          class="input input-bordered w-full pl-7"
          on:input={checkHandleAvailability}
          class:input-error={!isValid && isTouched}
          class:input-warning={isTaken && isChanged}
          class:input-success={isAvailable && isValid && !loading && isTouched && isChanged}
        />
      </div>
    </div>
    <button type="submit" class="btn btn-primary" {disabled}>
      {#if showLoading && $working.length}
        <span class="loading loading-sm" />
      {/if}
      Save
    </button>
  </div>
  <div class="w-full text-left pl-3">
    {#if loading}
      <p class="text-sm">
        Checking availability of <span class="text-neutral">@{handle}</span>...
      </p>
    {/if}

    {#if !isValid && isTouched}
      <p class="text-error text-sm">must be 3-32 characters long, alphanumeric only.</p>
    {/if}

    {#if isValid && !isAvailable && !loading && isChanged}
      <p class="text-warning text-sm">
        @{handle} is not available.
      </p>
    {/if}

    {#if !loading && !isChanged}
      <p class="text-sm">
        <ProfileLink {handle} />
        is your handle.
      </p>
    {:else if !disabled}
      <p class="text-sm">
        <span class="text-success">@{handle}</span> is available, press Save.
      </p>
    {/if}
  </div>
</div>
