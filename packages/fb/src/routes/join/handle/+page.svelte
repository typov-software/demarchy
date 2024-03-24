<script lang="ts">
  import { enhance } from "$app/forms";
  import AuthCheck from "$lib/components/AuthCheck.svelte";
  import HandleEditor from "$lib/components/HandleEditor.svelte";
  import { joinVoucher } from "$lib/firebase";
  import { workingCallback } from "$lib/stores/working";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<AuthCheck inline back="/join" condition={$joinVoucher?.redeemed === true}>
  <p class="w-full max-w-sm text-left pb-4 self-start">
    Across groups and organizations, people will know you by your
    <span class="d-anim-text-walk">handle</span>
  </p>
  <form
    method="post"
    action="?/updateHandle"
    use:enhance={workingCallback({
      reset: false,
      invalidateAll: true
    })}
    class="w-full"
  >
    <HandleEditor currentHandle={data.profile?.handle ?? ""} />
  </form>
  <p class="w-full max-w-xs text-right pt-4 text-neutral text-sm self-end">
    You can change your handle later, so don't sweat it
  </p>
  {#if data.profile?.handle}
    <a class="btn btn-success self-end mt-4" href="/join/profile">
      Update your Profile
      <span class="material-symbols-outlined">navigate_next</span>
    </a>
  {/if}
</AuthCheck>
