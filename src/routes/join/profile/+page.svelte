<script lang="ts">
  import AuthCheck from '$lib/components/AuthCheck.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import { db, profile, storage, user } from '$lib/firebase';
  import { emptyString } from '$lib/utils/string';
  import { doc, setDoc } from 'firebase/firestore';
  import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

  $: profileName = $profile?.name;
  $: name = profileName ?? '';
  $: disabled = !$profile || (!emptyString(profileName) && profileName === name);

  let previewURL: string;
  let uploading = false;
  $: href = `/${$profile?.id}/edit`;

  async function confirmName() {
    await setDoc(doc(db, 'profiles', $user!.uid), { name }, { merge: true });
  }

  async function upload(e: any) {
    uploading = true;
    const file = e.target.files[0];
    previewURL = URL.createObjectURL(file);
    const storageRef = ref(storage, `profiles/${$user!.uid}/profile.png`);
    const result = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(result.ref);

    await setDoc(doc(db, 'profiles', $user!.uid), { photo_url: url }, { merge: true });
    uploading = false;
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

  <form class="max-w-screen-md w-full">
    <div class="form-control w-full max-w-xs my-10 mx-auto text-center">
      <img
        src={previewURL ?? $profile?.photo_url ?? '/user.png'}
        alt="photo_url"
        class="mx-auto w-full"
      />
      <label for="photo_url" class="label">
        <span class="label-text">Pick a file</span>
      </label>
      <input
        on:change={upload}
        id="photo_url"
        name="photo_url"
        type="file"
        class="file-input file-input-bordered w-full max-w-xs"
        accept="image/png, image/jpeg, image/gif, image/webp"
      />
      {#if uploading}
        <p>Uploading...</p>
        <progress class="progress progress-info w-56 mt-6" />
      {/if}
    </div>
  </form>

  <a href="/d" class="btn btn-success">Go to dashboard</a>
  <PageView />
</AuthCheck>
