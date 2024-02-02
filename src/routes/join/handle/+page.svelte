<script lang="ts">
  import { enhance } from '$app/forms';
  import AuthCheck from '$lib/components/AuthCheck.svelte';
  import HandleEditor from '$lib/components/HandleEditor.svelte';
  import { workingCallback } from '$lib/stores/working';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<AuthCheck>
  <form
    method="post"
    action="?/updateHandle"
    use:enhance={workingCallback({
      reset: false,
      invalidateAll: true
    })}
    class="w-full"
  >
    <HandleEditor currentHandle={data.profile?.handle ?? ''} />
  </form>
  {#if data.profile?.handle}
    <a class="btn btn-success self-end mt-4" href="/join/profile">
      Update your Profile
      <span class="material-symbols-outlined">navigate_next</span>
    </a>
  {/if}
</AuthCheck>
