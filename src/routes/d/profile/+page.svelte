<script lang="ts">
  import { enhance } from '$app/forms';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import ProfilePhotoEditor from '$lib/components/ProfilePhotoEditor.svelte';
  import type { PageData } from './$types';
  import { working } from '$lib/stores/working';
  import HandleEditor from '$lib/components/HandleEditor.svelte';

  export let data: PageData;
  let name = data.profile.name;
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
    <HandleEditor initialValue={data.profile.handle} />
  </form>
</BasicSection>

<PageView />
