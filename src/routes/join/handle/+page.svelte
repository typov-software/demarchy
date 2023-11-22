<script lang="ts">
  import AuthCheck from '$lib/components/AuthCheck.svelte';
  import { db, profile, user } from '$lib/firebase';
  import { doc, getDoc, writeBatch } from 'firebase/firestore';

  $: profileHandle = $profile?.handle;
  $: handle = profileHandle ?? '';
  let loading = false;
  let isAvailable = false;
  let debounceTimer: NodeJS.Timeout;

  const re = /^(?=[a-zA-Z0-9._]{3,33}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
  $: isValid = handle?.length > 2 && handle.length <= 32 && re.test(handle);
  $: isTouched = handle.length > 0;
  $: isTaken = isValid && !isAvailable && !loading;

  async function checkHandleAvailability() {
    isAvailable = false;
    clearTimeout(debounceTimer);

    loading = true;
    debounceTimer = setTimeout(async () => {
      console.log(`Checking availability of ${handle}`);
      const ref = doc(db, 'handles', handle);
      const exists = await getDoc(ref).then((doc) => doc.exists());

      isAvailable = !exists;
      loading = false;
    }, 500);
  }

  async function confirmHandle() {
    console.log('confirming handle', handle);
    const batch = writeBatch(db);
    batch.set(doc(db, 'handles', handle), { uid: $user!.uid });
    batch.set(
      doc(db, 'profiles', $user!.uid),
      {
        handle
      },
      { merge: true }
    );
    await batch.commit();

    handle = '';
    isAvailable = false;
  }
</script>

<AuthCheck>
  <form class="w-2/5" on:submit|preventDefault={confirmHandle}>
    <input
      type="text"
      placeholder="Handle"
      class="input w-full"
      bind:value={handle}
      on:input={checkHandleAvailability}
      class:input-error={!isValid && isTouched}
      class:input-warning={isTaken && profileHandle !== handle}
      class:input-success={isAvailable && isValid && !loading}
    />
    <div class="my-4 min-h-16 px-8 w-full">
      {#if loading}
        <p class="text-secondary">Checking availability of @{handle}...</p>
      {/if}

      {#if !isValid && isTouched}
        <p class="text-error text-sm">must be 3-32 characters long, alphanumeric only</p>
      {/if}

      {#if isValid && !isAvailable && !loading && profileHandle !== handle}
        <p class="text-warning text-sm">
          @{handle} is not available
        </p>
      {/if}

      {#if isValid && !isAvailable && !loading && profileHandle === handle}
        <p class="text-secondary text-sm">
          @{handle} is your handle
        </p>
      {/if}

      {#if isAvailable}
        <button class="btn btn-success">Confirm username @{handle} </button>
      {/if}
    </div>
  </form>
</AuthCheck>
