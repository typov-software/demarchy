<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="flex flex-1" />

<BasicSection otherClass="py-8">
  <header class="flex flex-col items-center gap-2">
    <img
      src={data.userProfile.photo_url ?? '/user.png'}
      alt="photo_url"
      class="mx-auto mb-4 rounded-full w-2/3"
    />
    <h2 class="text-xl">{data.userProfile.name}</h2>
    <h3 class="text-success">@{data.userProfile.handle}</h3>
  </header>
</BasicSection>
