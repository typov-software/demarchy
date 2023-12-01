<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { db, storage } from '$lib/firebase';
  import { getCroppedImg, type Crop } from '$lib/utils/canvas';
  import { doc, setDoc } from 'firebase/firestore';
  import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
  import Cropper from 'svelte-easy-crop';
  import type { ChangeEventHandler } from 'svelte/elements';

  export let uid: string;

  let crop: Crop = { x: 0, y: 0 };
  let zoom = 1;
  let image: string | null;
  let fileinput: string | null;
  let croppedImage: Blob | null;
  let pixelCrop: Crop;
  let uploading = false;

  const onFileSelected: ChangeEventHandler<HTMLInputElement> = (e: any) => {
    const imageFile = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (onloadEvent: any) => {
      image = onloadEvent.target.result;
    };
    reader.readAsDataURL(imageFile);
  };

  const previewCrop = (e: any) => {
    pixelCrop = e.detail.pixels;
  };

  const saveImage = async () => {
    uploading = true;
    croppedImage = await getCroppedImg(image!, pixelCrop);
    const storageRef = ref(storage, `profiles/${uid}/profile.png`);
    const result = await uploadBytes(storageRef, croppedImage!);
    const url = await getDownloadURL(result.ref);
    await setDoc(doc(db, 'profiles', uid), { photo_url: url }, { merge: true });
    uploading = false;
    croppedImage = null;
    image = null;
    await invalidateAll();
  };
</script>

<form class="flex flex-col items-center max-w-xs w-full gap-4">
  <input
    disabled={uploading}
    bind:value={fileinput}
    on:change={onFileSelected}
    id="photo_url"
    name="photo_url"
    type="file"
    class="file-input file-input-bordered w-full max-w-xs"
    accept="image/png, image/jpeg, image/gif, image/webp"
  />
  {#if uploading}
    <p class="py-">Uploading...</p>
    <progress class="progress progress-info w-full my-2" />
  {/if}
  {#if image}
    <div class="cropper-wrap relative w-80 h-80">
      <Cropper {image} bind:crop bind:zoom aspect={1} on:cropcomplete={previewCrop} />
    </div>
    <button class="btn btn-primary w-full" on:click={saveImage}>Save</button>
  {/if}
</form>
