<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Notification, NotificationInvitationData } from '$lib/models/notifications';

  export let notification: Notification<NotificationInvitationData>;
</script>

<li class="card">
  <div class="card-body">
    <p>{notification.read}</p>
  </div>
  <div class="card-actions">
    <form method="POST" action="?/rejectInvitation" use:enhance>
      <input type="hidden" name="organization_id" value={notification.data.organization_id} />
      <input type="hidden" name="invitation_id" value={notification.data.invitation_id} />
      <input type="hidden" name="notification_id" value={notification.id} />
      <button>Reject</button>
    </form>
    <form method="POST" action="?/acceptInvitation" use:enhance>
      <input type="hidden" name="organization_id" value={notification.data.organization_id} />
      <input type="hidden" name="invitation_id" value={notification.data.invitation_id} />
      <input type="hidden" name="notification_id" value={notification.id} />
      <button>Accept</button>
    </form>
  </div>
</li>
