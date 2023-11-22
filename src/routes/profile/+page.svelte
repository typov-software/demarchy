<script lang="ts">
  import AuthCheck from '$lib/components/AuthCheck.svelte';
  import { profile } from '$lib/firebase';
</script>

<AuthCheck>
  <main class="flex flex-col w-full items-center">
    <h2>{$profile?.name}</h2>
    <img
      src={$profile?.photo_url ?? '/user.png'}
      alt="photo_url"
      width="64"
      height="64"
      class="mx-auto"
    />
  </main>
</AuthCheck>
