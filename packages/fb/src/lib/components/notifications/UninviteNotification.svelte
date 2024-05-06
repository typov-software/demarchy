<script lang="ts">
  import type { Notification, UninviteNotificationData } from '$lib/models/notifications';

  export let notification: Notification<UninviteNotificationData>;

  let isOrgInvite = notification.data.organization_id === notification.data.group_id;
</script>

{#if isOrgInvite}
  <p>
    Your invitation to
    <strong class="text-info">
      {notification.data.organization_name}
    </strong>
    has been canceled.
  </p>
{:else}
  <p>
    Your invitation to
    <strong class="text-info">
      {notification.data.group_name}
    </strong>
    from
    <strong class="text-info">
      {notification.data.organization_name}
    </strong>
    has been canceled.
  </p>
{/if}
