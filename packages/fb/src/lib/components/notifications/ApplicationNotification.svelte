<script lang="ts">
  import type { Notification, ApplicationNotificationData } from '$lib/models/notifications';

  export let notification: Notification<ApplicationNotificationData>;
</script>

<p>
  {notification.data.text}
</p>
