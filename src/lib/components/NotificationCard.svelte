<script lang="ts">
  import type { Notification, NotificationInvitationData } from '$lib/models/notifications';
  import InvitationNotification from './notifications/InvitationNotification.svelte';

  export let notification: Notification<any>;
</script>

{#if notification.type === 'invitation'}
  <InvitationNotification {notification} />
{/if}
