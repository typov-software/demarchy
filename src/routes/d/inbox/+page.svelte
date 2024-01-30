<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import NotificationCard from '$lib/components/NotificationCard.svelte';
  import type { Notification } from '$lib/models/notifications';
  import type { PageData } from './$types';

  export let data: PageData;

  let notifications = data.notifications.slice();
  $: notifications;

  function handleDeleted(e: CustomEvent<Notification>) {
    notifications = notifications.filter((n) => n.id !== e.detail.id);
  }
</script>

<BasicSection otherClass="w-full items-stretch">
  <h2 class="text-xl">Your inbox</h2>
  <ul class="w-full max-w-xl self-center">
    {#each notifications as notification (notification.id)}
      <NotificationCard {notification} on:deleted={handleDeleted} />
    {/each}
  </ul>
</BasicSection>
