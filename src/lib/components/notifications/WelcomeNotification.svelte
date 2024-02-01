<script lang="ts">
  import type { Notification, NotificationWelcomeData } from '$lib/models/notifications';
  import ProfileLink from '../ProfileLink.svelte';

  export let notification: Notification<NotificationWelcomeData>;
</script>

<p>
  Welcome to Demarchy, <ProfileLink handle={notification.data.profile_handle} />!
</p>
