<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Notification, InvitationNotificationData } from '$lib/models/notifications';
  import { workingCallback } from '$lib/stores/working';
  import { createEventDispatcher } from 'svelte';
  import ProfileLink from '../ProfileLink.svelte';

  const dispatch = createEventDispatcher();

  export let notification: Notification<InvitationNotificationData>;

  let rejectModal: HTMLDialogElement;
  let isOrgInvite = notification.data.organization_id === notification.data.group_id;
</script>

{#if isOrgInvite}
  <p>
    <ProfileLink handle={notification.data.invited_by_handle} />
    has invited you to join
    <strong class="text-info">
      {notification.data.organization_name}
    </strong>
  </p>
{:else}
  <p>
    <ProfileLink handle={notification.data.invited_by_handle} />
    from
    <strong class="text-info">
      {notification.data.organization_name}
    </strong>
    has invited you to join
    <strong class="text-info">
      {notification.data.group_name}
    </strong>
  </p>
{/if}
<div class="card-actions mt-2">
  <div class="flex-1" />
  <button
    class="btn btn-sm btn-secondary btn-outline"
    title="Confirm invite rejection"
    on:click={() => rejectModal.showModal()}
  >
    Reject
  </button>
  <form
    method="POST"
    action="?/acceptInvitation"
    use:enhance={workingCallback({
      invalidateAll: true,
    })}
  >
    <input type="hidden" name="organization_id" value={notification.data.organization_id} />
    <input type="hidden" name="group_id" value={notification.data.group_id} />
    <input type="hidden" name="invitation_id" value={notification.data.invitation_id} />
    <input type="hidden" name="notification_id" value={notification.id} />
    <button class="btn btn-sm btn-primary" title="Accept invitation">Accept</button>
  </form>
</div>

<dialog bind:this={rejectModal} id="reject-invitation" class="modal">
  <div class="modal-box">
    <p class="">
      {#if isOrgInvite}
        Are you sure you want to reject <ProfileLink
          handle={notification.data.invited_by_handle}
        />'s invitation to {notification.data.organization_name}?
      {:else}
        Are you sure you want to reject <ProfileLink
          handle={notification.data.invited_by_handle}
        />'s invitation to {notification.data.organization_name}/{notification.data.group_name}?
      {/if}
    </p>
    <div class="flex justify-end pt-2 gap-2">
      <form
        method="POST"
        action="?/rejectInvitation"
        use:enhance={workingCallback({
          invalidateAll: true,
          onEnd() {
            rejectModal.close();
            dispatch('deleted', notification);
          },
        })}
      >
        <input type="hidden" name="organization_id" value={notification.data.organization_id} />
        <input type="hidden" name="group_id" value={notification.data.group_id} />
        <input type="hidden" name="invitation_id" value={notification.data.invitation_id} />
        <input type="hidden" name="notification_id" value={notification.id} />
        <button class="btn btn-sm btn-secondary" on:click={() => {}}>Reject invitation</button>
      </form>
      <button class="btn btn-sm btn-neutral" on:click={() => rejectModal.close()}>Cancel</button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
