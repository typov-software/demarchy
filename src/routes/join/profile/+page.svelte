<script lang="ts">
  import AuthCheck from '$lib/components/AuthCheck.svelte';
  import ProfilePhotoEditor from '$lib/components/ProfilePhotoEditor.svelte';
  import { db, joinVoucher, user } from '$lib/firebase';
  import { emptyString } from '$lib/utils/string';
  import { doc, setDoc } from 'firebase/firestore';
  import type { PageData } from './$types';
  import { invalidateAll } from '$app/navigation';

  export let data: PageData;

  $: updatingName = false;
  $: profileName = data.profile?.name ?? '';
  $: name = profileName ?? '';
  $: disabled =
    updatingName || !data.profile || (!emptyString(profileName) && profileName === name);
  $: user_id = $user?.uid;

  async function confirmName() {
    if (updatingName) return;
    updatingName = true;
    try {
      await setDoc(doc(db, 'profiles', user_id!), { name }, { merge: true });
      await invalidateAll();
    } catch (e) {
      console.error(e);
    } finally {
      updatingName = false;
    }
  }
</script>

<AuthCheck inline back="/join" condition={$joinVoucher !== null}>
  <p class="w-full max-w-sm text-left self-start pb-4">
    Choose how others will see
    <span class="d-anim-text-walk">you</span>
  </p>
  <form class="w-full flex flex-row items-end" on:submit|preventDefault={confirmName}>
    <div class="flex flex-1 flex-col items-start w-full gap-2">
      <label for="name" class="text-sm text-neutral">Name</label>
      <input
        type="text"
        id="name"
        autocomplete="name"
        placeholder="Name"
        class="input input-bordered w-full"
        bind:value={name}
      />
    </div>
    <button {disabled} type="submit" class="btn btn-primary ml-5">
      {#if updatingName}
        <span class="loading loading-sm" />
      {/if}
      Save
    </button>
  </form>

  <div class="w-full">
    <div class="form-control w-full my-4 mx-auto text-center gap-4">
      {#if user_id}
        <ProfilePhotoEditor profileId={user_id} />
      {/if}
      <img
        src={data.profile?.photo_url ?? '/user.png'}
        alt="photo_url"
        class="mx-auto w-full max-w-xs mb-4 avatar rounded-full"
      />
    </div>
  </div>

  <a href="/d" class="btn btn-success self-end">
    Go to your Dashboard
    <span class="material-symbols-outlined">navigate_next</span>
  </a>
</AuthCheck>
