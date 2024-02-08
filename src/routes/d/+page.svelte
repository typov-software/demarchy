<script lang="ts">
  import { enhance } from '$app/forms';
  import AppToast from '$lib/components/AppToast.svelte';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import ProfileLink from '$lib/components/ProfileLink.svelte';
  import { toast } from '$lib/stores/toast';
  import { workingCallback } from '$lib/stores/working';
  import { emptyString } from '$lib/utils/string';
  import type { PageData } from './$types';

  export let data: PageData;

  $: requestingInvite = false;
  $: requestingVoucher = false;
  $: subscribing = false;
  $: email = '';
</script>

<BasicSection otherClass="w-full items-stretch">
  <div class="card my-4">
    <div class="card-body py-0 px-1.5 sm:max-w-4xl sm:self-center">
      <h2 class="card-title sm:text-2xl mb-2">Welcome,</h2>
      <p class="sm:text-lg">
        Thanks for joining during the <span class="d-anim-text-walk">early</span> adoption phase &mdash;
        where members are granted access to features still under active development.
      </p>
      <p class="text-sm sm:text-base">
        During this phase, expect rough edges and features to be incomplete or unstable. As such,
        <strong class="d-anim-text-walk"> do not share private information </strong> in comments, discussions,
        and library docs.
      </p>
      <p class="text-sm sm:text-base">
        For example, the ability to delete groups and comments is currently unavailable &mdash; take
        care!
      </p>
      <p class="text-sm sm:text-base">
        If you haven't received an invitation to the Demarchy organization yet, request one here:
      </p>
      <div class="flex flex-col">
        <form
          id="submit-application"
          method="post"
          action="?/submitApplication"
          class="hidden"
          use:enhance={workingCallback({
            onStart() {
              requestingInvite = true;
            },
            onEnd() {
              requestingInvite = false;
              toast.add({
                level: 'info',
                content: `Your request to join has be received`
              });
            }
          })}
        >
          <input type="hidden" name="profile_handle" value={data.profile.handle} />
          <input type="hidden" name="organization_id" value="psWhCdIftOCR2vMbBNH0" />
          <input type="hidden" name="group_id" value="psWhCdIftOCR2vMbBNH0" />
          <!-- <input type="hidden" name="organization_id" value="XQweByNkFu1wZIN9ie1N" />
          <input type="hidden" name="group_id" value="XQweByNkFu1wZIN9ie1N" /> -->
          <input type="hidden" name="text" value={`You requested an invitation to Demarchy`} />
        </form>
        <button
          form="submit-application"
          disabled={requestingInvite}
          class="btn btn-success btn-sm self-center my-4"
          title="Apply for membership"
        >
          {#if requestingInvite}
            <span class="loading" />
          {:else}
            <span class="material-symbols-outlined">approval_delegation</span>
          {/if}
          Request an invite
        </button>
        <small class="self-end">
          -- <ProfileLink handle="david" /> <span class="text-neutral">2024.02.06</span>
        </small>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
    <div class="card bg-base-200">
      <div class="card-body">
        <h3 class="card-title">Subscribe to the Devlog</h3>
        <p>
          No more than once a week and likely sporadic, these updates will be dry and full of
          engineering-speak. <strong class="d-anim-text-walk">Still interested?</strong>
        </p>
        <form
          class="flex flex-col items-start w-full gap-2"
          method="post"
          action="?/subscribeToDevlog"
          use:enhance={workingCallback({
            reset: true,
            onStart() {
              subscribing = true;
            },
            onEnd() {
              subscribing = false;
              toast.add({
                level: 'success',
                content:
                  'Thanks for subscribing to the Devlog! You can [unsubscribe](/unsubscribe) at any time.'
              });
            }
          })}
        >
          <div class="flex flex-col sm:flex-row gap-2 w-full sm:max-w-md">
            <input
              disabled={subscribing}
              bind:value={email}
              type="email"
              name="email"
              placeholder="Email"
              class="input input-bordered w-full"
            />
            <button disabled={subscribing || emptyString(email)} class="btn btn-primary"
              >Subscribe</button
            >
          </div>
          <small>The email you submit will not be connected to your Demarchy account.</small>
        </form>
      </div>
    </div>

    <div class="card bg-base-200">
      <div class="card-body">
        <h3 class="card-title">Request a Voucher</h3>
        <p>
          Certain actions, like creating accounts and organizations, require an unredeemed
          <strong class="d-anim-text-walk">Voucher</strong>.
        </p>
        <div
          class="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-start w-full gap-2 py-2"
        >
          <form
            method="post"
            action="?/requestVoucher"
            use:enhance={workingCallback({
              invalidateAll: true,
              onStart() {
                requestingVoucher = true;
              },
              onEnd() {
                requestingVoucher = false;
                toast.add({
                  level: 'info',
                  content: 'Voucher requested'
                });
              }
            })}
          >
            <input type="hidden" name="type" value="/join" />
            <button disabled={requestingVoucher} class="btn btn-secondary btn-outline"
              >Invite early adopter</button
            >
          </form>
          <form
            method="post"
            action="?/requestVoucher"
            use:enhance={workingCallback({
              invalidateAll: true,
              onStart() {
                requestingVoucher = true;
              },
              onEnd() {
                requestingVoucher = false;
                toast.add({
                  level: 'info',
                  content: 'Voucher requested'
                });
              }
            })}
          >
            <input type="hidden" name="type" value="/d/organizations/new" />
            <button disabled={requestingVoucher} class="btn btn-primary btn-outline"
              >Create an organization</button
            >
          </form>
        </div>
        <small>See "Your Vouchers" in the top-right user menu.</small>
      </div>
    </div>
  </div>
</BasicSection>

<AppToast />
