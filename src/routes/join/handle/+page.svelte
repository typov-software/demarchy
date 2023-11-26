<script lang="ts">
  import AuthCheck from '$lib/components/AuthCheck.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import { db, profile, user } from '$lib/firebase';
  import { doc, getDoc, writeBatch } from 'firebase/firestore';

  $: profileHandle = $profile?.handle;
  $: handle = profileHandle ?? '';
  let loading = false;
  let isAvailable = false;
  let debounceTimer: NodeJS.Timeout;

  const re = /^(?=[a-zA-Z0-9._]{3,33}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
  $: isValid = handle.length > 2 && handle.length <= 32 && re.test(handle);
  $: isTouched = handle.length > 0;
  $: isTaken = isValid && !isAvailable && !loading;

  async function checkHandleAvailability() {
    isAvailable = false;
    clearTimeout(debounceTimer);

    loading = true;
    debounceTimer = setTimeout(async () => {
      const ref = doc(db, 'handles', handle);
      const exists = await getDoc(ref).then((doc) => doc.exists());
      isAvailable = !exists;
      loading = false;
    }, 500);
  }

  async function confirmHandle() {
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
  <form class="w-full" on:submit|preventDefault={confirmHandle}>
    <input
      disabled={$profile?.handle !== undefined}
      type="text"
      placeholder="Handle"
      class="input w-full"
      bind:value={handle}
      on:input={checkHandleAvailability}
      class:input-error={!isValid && isTouched}
      class:input-warning={isTaken && profileHandle !== handle}
      class:input-success={isAvailable && isValid && !loading}
    />
    <div class="mt-4 w-full">
      {#if loading}
        <p class="text-secondary text-sm">Checking availability of @{handle}...</p>
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
        <div>
          <p class="text-accent text-sm mb-4">
            @{handle} is your handle, rejoice!
          </p>
          <a href="/join/profile" class="btn btn-primary">Next</a>
        </div>
      {/if}

      {#if isAvailable}
        <button class="btn btn-success">Confirm username @{handle} </button>
      {/if}
    </div>
  </form>
  <PageView />
</AuthCheck>
