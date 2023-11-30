<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<BasicSection>
  <h2>{data.profile.name}</h2>
  <img
    src={data.profile.photo_url ?? '/user.png'}
    alt="photo_url"
    width="64"
    height="64"
    class="mx-auto"
  />
</BasicSection>

<div class="flex-1" />
<PageView />
