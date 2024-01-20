<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import CommentCard from '$lib/components/CommentCard.svelte';
  import { db, user } from '$lib/firebase';
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
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
    Query
  } from 'firebase/firestore';
  import type { CommentProps } from '$lib/models/comments';
  import { inview } from 'svelte-inview';
  import { fly } from 'svelte/transition';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import CommentEditor from '$lib/components/CommentEditor.svelte';
  import { makeDocument } from '$lib/models/utils';

  export let data: PageData;

  $: showForm = true;

  $: userId = $user!.uid;

  $: comments = [] as QueryDocumentSnapshot<DocumentData, CommentProps>[];
  $: realtimeComments = [] as QueryDocumentSnapshot<DocumentData, CommentProps>[];
  $: hasMore = true;
  $: loadingMore = false;

  let unsubscribe: undefined | (() => void);
  $: unsubscribe = undefined;
  $: settingUp = false;

  async function getPage() {
    if (!hasMore || loadingMore) {
      return;
    }
    loadingMore = true;
    const after = comments.slice().pop();
    let snapshot;
    if (after) {
      const q = query(
        collection(db, 'organizations', data.organization.id, 'groups', data.group!.id, 'feedback'),
        orderBy('created_at', 'desc'),
        startAfter(after),
        limit(10)
      );
      snapshot = await getDocs(q);
    } else {
      const q = query(
        collection(db, 'organizations', data.organization.id, 'groups', data.group!.id, 'feedback'),
        orderBy('created_at', 'desc'),
        limit(10)
      );
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
      q = query(
        collection(db, 'organizations', data.organization.id, 'groups', data.group!.id, 'feedback'),
        orderBy('created_at', 'asc'),
        startAfter(after)
      );
    } else {
      q = query(
        collection(db, 'organizations', data.organization.id, 'groups', data.group!.id, 'feedback'),
        orderBy('created_at', 'asc')
      );
    }
    unsubscribe = await onSnapshot(q, (snapshot) => {
      const newComments = snapshot
        .docChanges()
        .filter((c) => c.type === 'added')
        .map((c) => c.doc)
        .slice() as QueryDocumentSnapshot<DocumentData, CommentProps>[];
      if (newComments.length) {
        realtimeComments = [...realtimeComments, ...newComments];
      }
    });
    settingUp = false;
  }

  function teardown() {
    if (unsubscribe) {
      unsubscribe();
    }
    comments = [];
    realtimeComments = [];
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

<BasicSection otherClass="py-0 pb-2">
  <div class="flex flex-row w-full items-center">
    <Breadcrumbs organization={data.organization} groups={data.groups} group={data.group} />
    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-square btn-sm btn-primary rounded-xl">
        <span class="material-symbols-outlined">more_vert</span>
      </div>
      <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
        <ul class="menu w-60">
          <li>
            <button
              on:click={(e) => {
                showForm = true;
                e.currentTarget.blur();
              }}
            >
              <span class="material-symbols-outlined">add_comment</span>
              Add feedback
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>

  {#if showForm}
    <div class="max-w-xl w-full">
      <CommentEditor
        collectionPath={`/organizations/${data.organization.id}/groups/${data.group.id}/feedback`}
        organizationId={data.organization.id}
        groupId={data.group.id}
        userId={data.profile.id}
        userHandle={data.profile.handle}
        context="feedback"
        contextId={null}
        parent={null}
        depth={0}
      />
    </div>
  {/if}

  {#if realtimeComments.length}
    <ul class="w-full flex flex-col-reverse gap-4 items-center">
      {#each realtimeComments as comment}
        <li class="w-full max-w-xl" in:fly={{ x: -50 }}>
          <CommentCard
            comment={makeDocument(comment)}
            {userId}
            context="feedback"
            contextId={comment.id}
          />
        </li>
      {/each}
    </ul>
    <div class="divider divider-primary text-secondary text-sm p-0 m-0">
      <span class="text-base-content"> New comments </span>
    </div>
  {/if}

  <ul class="w-full flex flex-col gap-4 items-center">
    {#each comments as comment}
      <li class="w-full max-w-xl" in:fly={{ x: -50 }}>
        <CommentCard
          comment={makeDocument(comment)}
          {userId}
          context="feedback"
          contextId={comment.id}
        />
      </li>
    {/each}
  </ul>

  {#if hasMore}
    <div class="loading" />
  {:else}
    <div class="flex items-center gap-4">
      <p class="text-xs">End of feedback</p>
      <button class="btn btn-sm" on:click={() => window.scrollTo({ top: 0 })}>
        <span class="material-symbols-outlined">arrow_upward</span>
        Jump to top
      </button>
    </div>
  {/if}
  <div use:inview={{}} on:inview_enter={() => getPage()} />
</BasicSection>
