<script lang="ts">
  import { enhance } from '$app/forms';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import ProfileLink from '$lib/components/ProfileLink.svelte';
  import { workingCallback } from '$lib/stores/working';
  import type { PageData } from './$types';

  export let data: PageData;

  $: requestingInvite = false;
</script>

<BasicSection otherClass="w-full items-stretch">
  <div class="card bg-base-200">
    <div class="card-body sm:text-lg">
      <h2 class="card-title sm:text-2xl">Welcome Early Adopters,</h2>
      <p>
        Thanks for joining during the <span class="d-anim-text-walk">early</span> adoption phase &mdash;
        where members are granted access to features still under active development.
      </p>
      <p>
        During this phase, expect rough edges and features to be incomplete or unstable. As such,
        <strong class="d-anim-text-walk"> do not share private information </strong> in comments, discussions,
        and library docs.
      </p>
      <p>
        For example, the ability to delete groups and comments is currently unavailable &mdash; take
        care!
      </p>
      <p>
        If you haven't received an invitation to the Demarchy organization yet, request one here:
      </p>
      <form
        id="submit-application"
        method="post"
        action="?/submitApplication"
        class="hidden"
        use:enhance={workingCallback({
          invalidateAll: true,
          onStart() {
            requestingInvite = true;
          },
          onEnd() {
            requestingInvite = false;
          }
        })}
      >
        <input type="hidden" name="profile_handle" value={data.profile.handle} />
        <input type="hidden" name="organization_id" value="XQweByNkFu1wZIN9ie1N" />
        <input type="hidden" name="group_id" value="XQweByNkFu1wZIN9ie1N" />
        <input type="hidden" name="text" value={`You requested an invitation to Demarchy`} />
      </form>
      <button
        form="submit-application"
        disabled={requestingInvite}
        class="btn btn-primary self-start my-4"
        title="Apply for membership"
      >
        {#if requestingInvite}
          <span class="loading" />
        {:else}
          <span class="material-symbols-outlined">approval_delegation</span>
        {/if}
        Request an invite
      </button>
      <small>
        -- <ProfileLink handle="david" /> <span class="text-neutral">2024.02.06</span>
      </small>
    </div>
  </div>

  <div class="card">
    <div class="card-body">
      <h3 class="card-title">Sign up for the Newsletter</h3>
    </div>
  </div>

  <div class="card">
    <div class="card-body">
      <h3 class="card-title">Request a Voucher</h3>
      <p>
        Certain actions, like signing up and creating organizations, require an unredeemed
        <strong class="d-anim-text-walk">Voucher</strong>.
      </p>
      <p>You can see your vouchers in the user menu (top right) under Your Vouchers.</p>
    </div>
  </div>
</BasicSection>
