<script lang="ts">
  import AuthCheck from '$lib/components/AuthCheck.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import ProfilePhotoEditor from '$lib/components/ProfilePhotoEditor.svelte';
  import { db, user } from '$lib/firebase';
  import { emptyString } from '$lib/utils/string';
  import { doc, setDoc } from 'firebase/firestore';
  import type { PageData } from './$types';
  import { invalidateAll } from '$app/navigation';

  export let data: PageData;

  $: profileName = data.profile?.name ?? '';
  $: name = profileName ?? '';
  $: disabled = !data.profile || (!emptyString(profileName) && profileName === name);
  $: uid = $user?.uid;

  async function confirmName() {
    await setDoc(doc(db, 'profiles', uid!), { name }, { merge: true });
    await invalidateAll();
  }
</script>

<AuthCheck>
  <form class="w-full flex flex-row items-center" on:submit|preventDefault={confirmName}>
    <div class="flex flex-1 w-full">
      <input
        type="text"
        id="name"
        autocomplete="name"
        placeholder="Name"
        class="input w-full"
        bind:value={name}
      />
    </div>
    <button {disabled} type="submit" class="btn btn-success ml-5">Confirm</button>
  </form>

  <div class="max-w-screen-md w-full">
    <div class="form-control w-full max-w-xs my-4 mx-auto text-center">
      <img
        src={data.profile?.photo_url ?? '/user.png'}
        alt="photo_url"
        class="mx-auto w-full mb-4"
      />
      {#if uid}
        <ProfilePhotoEditor {uid} />
      {/if}
    </div>
  </div>

  <a href="/d" class="btn btn-success">Go to dashboard</a>
  <PageView />
</AuthCheck>
