<script lang="ts">
  import { db, user } from '$lib/firebase';
  import type { Notification } from '$lib/models/notifications';
  import { deleteDoc, doc, increment, serverTimestamp, writeBatch } from 'firebase/firestore';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let notification: Notification;
  $: notification;

  $: looking = false;
  $: deleting = false;

  async function handleClickSeen() {
    if (looking || notification.seen) return;
    looking = true;
    try {
      const userId = $user!.uid;
      const inboxRef = doc(db, `/inboxes/${userId}`);
      const notificationRef = doc(db, notification.path);
      const batch = writeBatch(db);
      batch.update(inboxRef, {
        updated_at: serverTimestamp(),
        [notification.category]: increment(-1),
        unread: increment(-1),
      });
      batch.update(notificationRef, {
        updated_at: serverTimestamp(),
        seen: 1,
      });
      await batch.commit();
      notification = { ...notification, seen: 1 };
    } catch (e) {
      console.error(e);
    } finally {
      looking = false;
    }
  }

  async function handleClickDelete() {
    if (deleting || !notification.seen) return;
    deleting = true;
    try {
      const notificationRef = doc(db, notification.path);
      await deleteDoc(notificationRef);
      dispatch('deleted', notification);
    } catch (e) {
      console.error(e);
    } finally {
      deleting = false;
    }
  }
</script>

<button
  class="flex flex-row items-center btn btn-xs"
  class:btn-filled={!notification.seen}
  class:btn-neutral={!notification.seen}
  class:btn-primary={notification.seen}
  class:pointer-events-none={notification.seen}
  on:click={handleClickSeen}
  title="Mark as seen"
>
  {#if looking}
    <div class="loading loading-xs loading-spinner" />
  {:else}
    <span class="material-symbols-outlined text-base">
      {notification.seen ? 'visibility' : 'visibility_off'}
    </span>
  {/if}
</button>

{#if notification.seen}
  <button
    class="flex flex-row items-center btn btn-xs btn-secondary btn-outline"
    on:click={handleClickDelete}
    title="Delete notification"
  >
    {#if deleting}
      <div class="loading loading-xs loading-spinner" />
    {:else}
      <span class="material-symbols-outlined text-base">delete</span>
    {/if}
  </button>
{/if}
