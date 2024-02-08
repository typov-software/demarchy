<script lang="ts">
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import NotificationCard from '$lib/components/NotificationCard.svelte';
  import { db, user } from '$lib/firebase';
  import type { InboxCategory } from '$lib/models/inboxes';
  import type { NotificationProps } from '$lib/models/notifications';
  import { makeDocument } from '$lib/models/utils';
  import {
    query,
    type DocumentData,
    type Query,
    type QueryDocumentSnapshot,
    orderBy,
    startAfter,
    limit,
    getDocs,
    collection,
    where,
    onSnapshot
  } from 'firebase/firestore';
  import { onMount, tick } from 'svelte';
  import { inview } from 'svelte-inview';
  import { fly } from 'svelte/transition';

  export let maxResults = 5;
  export let category: null | InboxCategory;

  let baseQuery: Query;
  let notifications: QueryDocumentSnapshot<DocumentData, NotificationProps<unknown>>[] = [];
  let latestNotifications: QueryDocumentSnapshot<DocumentData, NotificationProps<unknown>>[] = [];
  let containerEl: HTMLDivElement;

  $: userId = $user!.uid;
  $: hasMore = true;
  $: loadingMore = false;

  let collectionPath: string;
  $: collectionPath = `/inboxes/${userId}/notifications`;
  $: notifications, latestNotifications;

  let unsubscribe: undefined | (() => void);
  $: unsubscribe = undefined;
  $: settingUp = false;

  async function getPage() {
    if (!hasMore || loadingMore) {
      return;
    }
    loadingMore = true;
    const after = notifications.slice().pop();
    let snapshot;
    if (after) {
      const q = query(
        baseQuery,
        orderBy('created_at', 'desc'),
        startAfter(after),
        limit(maxResults)
      );
      snapshot = await getDocs(q);
    } else {
      const q = query(baseQuery, orderBy('created_at', 'desc'), limit(maxResults));
      snapshot = await getDocs(q);
    }
    const moreNotifications = snapshot.docs.slice() as QueryDocumentSnapshot<
      DocumentData,
      NotificationProps<unknown>
    >[];
    hasMore = snapshot.size >= maxResults;
    notifications = [...notifications, ...moreNotifications];
    loadingMore = false;
    await tick();
  }

  async function setup() {
    if (settingUp) {
      // A lifecycle method is already attempting to subscribe to firestore
      return;
    }
    settingUp = true;
    if (category) {
      baseQuery = query(collection(db, collectionPath), where('category', '==', category));
    } else {
      baseQuery = query(collection(db, collectionPath));
    }
    await getPage();
    const after = notifications.slice().shift();
    let q: Query;
    // Build query for new notifcations that come in, sorted by ascending
    if (after) {
      q = query(baseQuery, orderBy('created_at', 'asc'), startAfter(after));
    } else {
      q = query(baseQuery, orderBy('created_at', 'asc'));
    }
    unsubscribe = await onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot
        .docChanges()
        .filter((c) => c.type === 'added')
        .map((c) => c.doc)
        .slice() as QueryDocumentSnapshot<DocumentData, NotificationProps<unknown>>[];
      if (newNotifications.length) {
        latestNotifications = [...latestNotifications, ...newNotifications];
      }
    });
    settingUp = false;
  }

  function teardown() {
    if (unsubscribe) {
      unsubscribe();
    }
    notifications = [];
    latestNotifications = [];
    hasMore = true;
    loadingMore = false;
    unsubscribe = undefined;
  }

  onMount(() => {
    setup();
    return () => teardown();
  });

  beforeNavigate(({ from, to }) => {
    if (from?.url.searchParams.get('category') !== to?.url.searchParams.get('category')) {
      teardown();
    }
  });

  afterNavigate(() => {
    if (!unsubscribe) {
      setup();
    }
  });
</script>

<div class="flex flex-col items-center gap-4 w-full">
  {#if latestNotifications.length}
    <ul class="w-full flex flex-col-reverse gap-4 items-center">
      {#each latestNotifications as notification (notification.id)}
        <li class="w-full" in:fly={{ x: 50 }}>
          <NotificationCard
            notification={makeDocument(notification)}
            on:deleted={() => {
              latestNotifications = latestNotifications.filter((n) => n.id !== notification.id);
            }}
          />
        </li>
      {/each}
    </ul>
    <div class="divider divider-primary text-secondary text-sm p-0 m-0">
      <span class="text-base-content">
        <span class="material-symbols-outlined text-base">arrow_upward</span>
        New replies
        <span class="material-symbols-outlined text-base">arrow_upward</span>
      </span>
    </div>
  {/if}
  <ul class="w-full gap-2 flex flex-col">
    {#each notifications as notification (notification.id)}
      <NotificationCard
        notification={makeDocument(notification)}
        on:deleted={() => {
          notifications = notifications.filter((n) => n.id !== notification.id);
        }}
      />
    {/each}
  </ul>
  {#if hasMore}
    <div class="loading" />
  {:else}
    <div class="flex items-center gap-4">
      <p class="text-xs">End of notifcations</p>
      <button
        class="btn btn-sm"
        on:click={() => {
          containerEl.scrollTo({ top: 0 });
          window.scrollTo({ top: 0 });
        }}
      >
        <span class="material-symbols-outlined">arrow_upward</span>
        Jump to top
      </button>
    </div>
  {/if}
  {#if !settingUp}
    <div use:inview={{}} on:inview_enter={() => getPage()} />
  {/if}
</div>
