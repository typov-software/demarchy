<script lang="ts">
  import CommentCard from '$lib/components/CommentCard.svelte';
  import { db, profile, user } from '$lib/firebase';
  import { createEventDispatcher, onMount } from 'svelte';
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
  import type { CommentContext, Comment, CommentProps } from '$lib/models/comments';
  import { inview } from 'svelte-inview';
  import { fly } from 'svelte/transition';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import CommentEditor from '$lib/components/CommentEditor.svelte';
  import { makeDocument } from '$lib/models/utils';

  const dispatch = createEventDispatcher();

  export let organizationId: string;
  export let groupId: string;

  export let context: CommentContext;
  export let contextId: string | null;
  export let parent: string | null;
  export let depth: number = 0;

  export let threaded = false;
  export let highlighted: string[] = [];
  export let threadedColumns: number = 0;

  let containerEl: HTMLDivElement;

  let groupPath = `/organizations/${organizationId}/groups/${groupId}`;
  let collectionPath = groupPath;
  if (context === 'feedback') {
    collectionPath = `${groupPath}/feedback`;
  } else {
    collectionPath = `${groupPath}/${context}/${contextId}/comments`;
  }

  $: userId = $user!.uid;
  $: userHandle = $profile?.handle;
  $: showForm = true;

  $: comments = [] as QueryDocumentSnapshot<DocumentData, CommentProps>[];
  $: latestComments = [] as QueryDocumentSnapshot<DocumentData, CommentProps>[];
  $: hasMore = true;
  $: loadingMore = false;

  let unsubscribe: undefined | (() => void);
  $: unsubscribe = undefined;
  $: settingUp = false;

  $: baseQuery = query(collection(db, collectionPath), where('parent', '==', parent));

  async function getPage() {
    if (!hasMore || loadingMore) {
      return;
    }
    loadingMore = true;
    const after = comments.slice().pop();
    let snapshot;
    if (after) {
      const q = query(baseQuery, startAfter(after), limit(10));
      snapshot = await getDocs(q);
    } else {
      const q = query(baseQuery, orderBy('created_at', 'desc'), limit(10));
      snapshot = await getDocs(q);
    }
    const moreComments = snapshot.docs.slice() as QueryDocumentSnapshot<
      DocumentData,
      CommentProps
    >[];
    hasMore = snapshot.size >= 10;
    comments = [...comments, ...moreComments];
    loadingMore = false;
  }

  async function setup() {
    if (settingUp) {
      // A lifecycle method is already attempting to subscribe to firestore
      return;
    }
    settingUp = true;
    await getPage();
    const after = comments.slice().shift();
    let q: Query;
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

  // forward comment reply event to parent components
  function handleReply(e: CustomEvent<{ comment: Comment }>) {
    dispatch('reply', { comment: e.detail.comment });
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

<div
  bind:this={containerEl}
  class="flex flex-col items-center gap-4 w-full overflow-y-auto"
  class:max-w-3xl={!threadedColumns}
  class:max-w-xl={threadedColumns === 2}
  class:max-w-md={threadedColumns > 2}
>
  {#if showForm && userHandle}
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
            on:reply={handleReply}
          />
        </li>
      {/each}
    </ul>
    <div class="divider divider-primary text-secondary text-sm p-0 m-0">
      <span class="text-base-content"> New comments </span>
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
          on:reply={handleReply}
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
  <div use:inview={{}} on:inview_enter={() => getPage()} />
</div>
