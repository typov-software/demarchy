<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import ProfilePhotoEditor from '$lib/components/ProfilePhotoEditor.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<BasicSection>
  <h2>{data.profile.name}</h2>
  <img
    src={data.profile.photo_url ?? '/user.png'}
    alt="photo_url"
    width="320"
    height="320"
    class="mx-auto"
  />
  <ProfilePhotoEditor uid={data.profile.id} />
</BasicSection>

<div class="flex-1" />
<PageView />
