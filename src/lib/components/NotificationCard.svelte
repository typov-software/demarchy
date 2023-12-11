<script lang="ts">
  import type { Notification } from '$lib/models/notifications';
  import InvitationNotification from './notifications/InvitationNotification.svelte';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let notification: Notification<any>;
</script>

{#if notification.type === 'invitation'}
  <InvitationNotification {notification} />
{/if}
