<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Notification, NotificationInvitationData } from '$lib/models/notifications';

  export let notification: Notification<NotificationInvitationData>;
</script>

<li class="card bg-base-200 w-full">
  <div class="card-body">
    {#if notification.data.organization_id === notification.data.group_id}
      <p>
        Someone from
        <strong class="text-success">
          {notification.data.organization_name}
        </strong>
        has invited you to join
      </p>
    {:else}
      <p>
        Someone from
        <strong class="text-success">
          {notification.data.organization_name}
        </strong>
        has invited you to join
        <strong class="text-success">
          {notification.data.group_name}
        </strong>
      </p>
    {/if}
    <div class="card-actions mt-4">
      <div class="flex-1" />
      <form method="POST" action="?/rejectInvitation" use:enhance>
        <input type="hidden" name="organization_id" value={notification.data.organization_id} />
        <input type="hidden" name="invitation_id" value={notification.data.invitation_id} />
        <input type="hidden" name="notification_id" value={notification.id} />
        <button class="btn btn-error btn-outline">Reject</button>
      </form>
      <form method="POST" action="?/acceptInvitation" use:enhance>
        <input type="hidden" name="organization_id" value={notification.data.organization_id} />
        <input type="hidden" name="invitation_id" value={notification.data.invitation_id} />
        <input type="hidden" name="notification_id" value={notification.id} />
        <button class="btn btn-success">Accept</button>
      </form>
    </div>
  </div>
</li>
