<script lang="ts">
  import type { Notification, NotificationWelcomeData } from '$lib/models/notifications';
  import { createEventDispatcher } from 'svelte';
  import NotificationSeen from '../NotificationSeen.svelte';
  import ProfileLink from '../ProfileLink.svelte';

  const dispatch = createEventDispatcher();

  export let notification: Notification<NotificationWelcomeData>;
</script>

<li class="card bg-base-200 w-full">
  <div class="card-body p-6">
    <div class="card-title items-start">
      <h3 class="flex-1">Welcome</h3>
      <NotificationSeen {notification} on:deleted={(e) => dispatch('deleted', e.detail)} />
    </div>
    <p>
      Welcome to Demarchy, <ProfileLink handle={notification.data.profile_handle} />!
    </p>
  </div>
</li>
