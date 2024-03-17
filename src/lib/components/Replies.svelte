<script lang="ts">
  import CommentCard from '$lib/components/CommentCard.svelte';
  import { db, profile, user } from '$lib/firebase';
  import { onMount, tick } from 'svelte';
  import {
    orderBy,
    collection,
    getDocs,
    query,
    startAfter,
    limit,
    QueryDocumentSnapshot,
    type DocumentData,
    onSnapshot,
    Query,
    where
  } from 'firebase/firestore';
  import type { CommentContext, CommentProps } from '$lib/models/comments';
  import { inview } from 'svelte-inview';
  import { fly } from 'svelte/transition';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import CommentEditor from '$lib/components/CommentEditor.svelte';
  import { makeDocument } from '$lib/models/utils';

  export let can_write: boolean;
  export let organizationId: string;
  export let groupId: string;
  export let context: CommentContext;
  export let contextId: string | null;
  export let parent: string | null;
  export let depth: number = 0;

  export let threaded = false;
  export let highlighted: string[] = [];
  export let maxResults = 5;
  export let pinnable = false;

  let baseQuery: Query;
  let comments: QueryDocumentSnapshot<DocumentData, CommentProps>[] = [];
  let latestComments: QueryDocumentSnapshot<DocumentData, CommentProps>[] = [];
  let containerEl: HTMLDivElement;

  let collectionPath: string = getCollectionPath();
  $: collectionPath;

  $: userId = $user!.uid;
  $: userHandle = $profile?.handle;
  $: showForm = true;

  $: comments;
  $: latestComments;
  $: hasMore = true;
  $: loadingMore = false;

  let unsubscribe: undefined | (() => void);
  $: unsubscribe = undefined;
  $: settingUp = false;

  function getCollectionPath() {
    const groupPath = `/organizations/${organizationId}/groups/${groupId}`;
    let path = groupPath;
    if (context === 'feedback') {
      path = `${groupPath}/feedback`;
    } else {
      path = `${groupPath}/${context}/${contextId}/comments`;
    }
    return path;
  }

  async function getPage() {
    if (!hasMore || loadingMore) {
      return;
    }
    loadingMore = true;
    const after = comments.slice().pop();
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
    const moreComments = snapshot.docs.slice() as QueryDocumentSnapshot<
      DocumentData,
      CommentProps
    >[];
    hasMore = snapshot.size >= maxResults;
    comments = [...comments, ...moreComments];
    loadingMore = false;
    await tick();
  }

  async function setup() {
    if (settingUp) {
      // A lifecycle method is already attempting to subscribe to firestore
      return;
    }
    settingUp = true;
    collectionPath = getCollectionPath();
    baseQuery = query(collection(db, collectionPath), where('parent', '==', parent));
    await getPage();
    const after = comments.slice().shift();
    let q: Query;
    // Build query for new comments that come in, sorted by ascending
    if (after) {
      q = query(baseQuery, orderBy('created_at', 'asc'), startAfter(after));
    } else {
      q = query(baseQuery, orderBy('created_at', 'asc'));
    }
    unsubscribe = await onSnapshot(q, (snapshot) => {
      const newComments = snapshot
        .docChanges()
        .filter((c) => c.type === 'added')
        .map((c) => c.doc)
        .slice() as QueryDocumentSnapshot<DocumentData, CommentProps>[];
      if (newComments.length) {
        latestComments = [...latestComments, ...newComments];
      }
    });
    settingUp = false;
  }

  function teardown() {
    if (unsubscribe) {
      unsubscribe();
    }
    comments = [];
    latestComments = [];
    hasMore = true;
    loadingMore = false;
    unsubscribe = undefined;
  }

  onMount(() => {
    setup();
    return () => teardown();
  });

  beforeNavigate(({ from, to }) => {
    if (from?.url.pathname !== to?.url.pathname) {
      teardown();
    }
  });

  afterNavigate(() => {
    if (!unsubscribe) {
      setup();
    }
  });
</script>

<div class:w-full={!threaded} class:min-w-[85vw]={threaded} class:sm:min-w-[45vw]={threaded}>
  <div bind:this={containerEl} class="flex flex-col items-center gap-4 w-full">
    {#if can_write && showForm && userHandle}
      <div class="w-full">
        <CommentEditor
          {collectionPath}
          {organizationId}
          {groupId}
          {userHandle}
          {userId}
          {context}
          {contextId}
          {parent}
          {depth}
        />
      </div>
    {/if}

    {#if latestComments.length}
      <ul class="w-full flex flex-col-reverse gap-4 items-center">
        {#each latestComments as comment (comment.id)}
          <li class="w-full" in:fly={{ x: -50 }}>
            <CommentCard
              comment={makeDocument(comment)}
              {context}
              contextId={contextId ?? comment.id}
              {threaded}
              highlighted={highlighted.includes(comment.id)}
              {pinnable}
              on:reply
              on:pin:clarification
              on:pin:concern
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

    <ul class="w-full flex flex-col gap-4 items-center">
      {#each comments as comment (comment.id)}
        <li class="w-full" in:fly={{ x: -50 }}>
          <CommentCard
            comment={makeDocument(comment)}
            {context}
            contextId={contextId ?? comment.id}
            {threaded}
            highlighted={highlighted.includes(comment.id)}
            {pinnable}
            on:reply
            on:pin:clarification
            on:pin:concern
          />
        </li>
      {/each}
    </ul>

    {#if hasMore}
      <div class="loading" />
    {:else}
      <div class="flex items-center gap-4">
        <p class="text-xs">End of replies</p>
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
</div>
