<script lang="ts">
  import type { Notification } from '$lib/models/notifications';
  import { createEventDispatcher } from 'svelte';
  import InvitationNotification from './notifications/InvitationNotification.svelte';
  import WelcomeNotification from './notifications/WelcomeNotification.svelte';

  const dispatch = createEventDispatcher();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let notification: Notification<any>;
</script>

{#if notification.type === 'invitation'}
  <InvitationNotification {notification} />
{:else if notification.type === 'welcome'}
  <WelcomeNotification {notification} on:deleted={(e) => dispatch('deleted', e.detail)} />
{/if}
