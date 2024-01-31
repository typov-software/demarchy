<script lang="ts">
  import { enhance } from '$app/forms';
  import AuthCheck from '$lib/components/AuthCheck.svelte';
  import HandleEditor from '$lib/components/HandleEditor.svelte';
  import { workingCallback } from '$lib/stores/working';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<AuthCheck>
  <form method="post" action="?/updateHandle" use:enhance={workingCallback()}>
    <HandleEditor initialValue={data.profile?.handle ?? ''} />
  </form>
</AuthCheck>
