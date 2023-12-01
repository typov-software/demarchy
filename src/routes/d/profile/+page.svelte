<script lang="ts">
  import { enhance } from '$app/forms';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import ProfilePhotoEditor from '$lib/components/ProfilePhotoEditor.svelte';
  import { doc, getDoc } from 'firebase/firestore';
  import type { PageData } from './$types';
  import { db } from '$lib/firebase';
  import { working } from '$lib/stores/working';

  export let data: PageData;
  let name = data.profile.name;
  let handle = data.profile.handle;

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
</script>

<BasicSection otherClass="w-full max-w-md self-center">
  <img
    src={data.profile.photo_url ?? '/user.png'}
    alt="photo_url"
    class="mx-auto mt-4 rounded-full w-2/3"
  />
  <ProfilePhotoEditor uid={data.profile.id} />

  <form
    method="POST"
    action="?/updateName"
    use:enhance={() => {
      const jobId = working.add();
      return async ({ update }) => {
        working.remove(jobId);
        update({ reset: false });
      };
    }}
    class="flex items-end gap-4 w-full"
  >
    <div class="flex flex-col flex-1 items-start justify-end">
      <label for="name">Name</label>
      <input
        type="text"
        id="name"
        name="name"
        bind:value={name}
        class="input input-bordered w-full"
      />
    </div>
    <button type="submit" class="btn btn-primary" disabled={name === data.profile.name}>
      Save
    </button>
  </form>

  <form
    method="POST"
    action="?/updateHandle"
    use:enhance={() => {
      const jobId = working.add();
      return async ({ update }) => {
        working.remove(jobId);
        update({ reset: false });
      };
    }}
    class="flex flex-col gap-4 w-full"
  >
    <div class="flex items-end gap-4 w-full">
      <div class="flex flex-col flex-1 items-start justify-end">
        <label for="handle">Handle</label>
        <input
          type="text"
          id="handle"
          name="handle"
          bind:value={handle}
          class="input input-bordered w-full"
          on:input={checkHandleAvailability}
          class:input-error={!isValid && isTouched}
          class:input-warning={isTaken && handle !== data.profile.handle}
          class:input-success={isAvailable &&
            isValid &&
            !loading &&
            isTouched &&
            handle !== data.profile.handle}
        />
      </div>
      <button
        type="submit"
        class="btn btn-primary"
        disabled={!isAvailable ||
          loading ||
          !isValid ||
          !isTouched ||
          handle === data.profile.handle}
      >
        Save
      </button>
    </div>
    <div class="w-full">
      {#if loading}
        <p class="text-secondary text-sm">Checking availability of @{handle}...</p>
      {/if}

      {#if !isValid && isTouched}
        <p class="text-error text-sm">must be 3-32 characters long, alphanumeric only</p>
      {/if}

      {#if isValid && !isAvailable && !loading && data.profile.handle !== handle}
        <p class="text-warning text-sm">
          @{handle} is not available
        </p>
      {/if}

      {#if !loading && data.profile.handle === handle}
        <p class="text-accent text-sm">
          @{handle} is your handle, rejoice!
        </p>
      {/if}
    </div>
  </form>
</BasicSection>

<div class="flex-1" />
<PageView />
