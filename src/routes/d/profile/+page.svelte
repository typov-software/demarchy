<script lang="ts">
  import { enhance } from '$app/forms';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import ProfilePhotoEditor from '$lib/components/ProfilePhotoEditor.svelte';
  import type { PageData } from './$types';
  import { working, workingCallback } from '$lib/stores/working';
  import HandleEditor from '$lib/components/HandleEditor.svelte';

  export let data: PageData;
  let name = data.profile.name;
</script>

<BasicSection otherClass="w-full items-stretch">
  <h2 class="text-xl">Your Profile</h2>
  <p class="w-full max-w-sm text-left self-start">
    Choose how others will see
    <span class="d-anim-text-walk">you</span>
  </p>
  <div class="w-full max-w-md self-center flex flex-col gap-4">
    <img
      src={data.profile.photo_url ?? '/user.png'}
      alt="photo_url"
      class="mx-auto my-4 rounded-full w-2/3"
    />
    <ProfilePhotoEditor profileId={data.profile.id} />

    <form
      method="POST"
      action="?/updateName"
      use:enhance={workingCallback({
        invalidateAll: true
      })}
      class="flex items-end gap-4 w-full"
    >
      <div class="flex flex-col flex-1 items-start justify-end gap-2">
        <label for="name" class="text-sm text-neutral">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          bind:value={name}
          class="input input-bordered w-full"
        />
      </div>
      <button
        type="submit"
        class="btn btn-primary"
        disabled={name === data.profile.name || $working.length > 0}
      >
        Save
      </button>
    </form>

    <form
      method="POST"
      action="?/updateHandle"
      use:enhance={workingCallback()}
      class="flex flex-col gap-4 w-full"
    >
      <HandleEditor currentHandle={data.profile.handle} showLoading={false} />
    </form>
  </div>
</BasicSection>
