<script lang="ts">
  import AuthCheck from '$lib/components/AuthCheck.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<AuthCheck>
  <main class="flex flex-col w-full items-center">
    <h2>{data.profile.name}</h2>
    <img
      src={data.profile.photo_url ?? '/user.png'}
      alt="photo_url"
      width="64"
      height="64"
      class="mx-auto"
    />
  </main>
</AuthCheck>
