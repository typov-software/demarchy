<script lang="ts">
  import { enhance } from '$app/forms';
  import AuthCheck from '$lib/components/AuthCheck.svelte';
  import HandleEditor from '$lib/components/HandleEditor.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<AuthCheck>
  <form
    method="post"
    action="?/updateHandle"
    use:enhance={() => {
      return ({ update }) => {
        update({ reset: false });
      };
    }}
  >
    <HandleEditor initialValue={data.profile?.handle ?? ''} />
  </form>
  <PageView />
</AuthCheck>
