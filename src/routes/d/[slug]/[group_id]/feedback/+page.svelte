<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import { db } from '$lib/firebase';
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
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import Replies from '$lib/components/Replies.svelte';

  export let data: PageData;

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
      <div tabindex="0" role="button" class="btn btn-square btn-sm btn-primary">
        <span class="material-symbols-outlined">more_vert</span>
      </div>
      <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
        <ul class="menu w-60">
          <li>
            <button>
              <span class="material-symbols-outlined">add</span>
              TODO
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div class="flex flex-col items-center max-w-2xl w-full">
    <Replies
      organizationId={data.organization.id}
      groupId={data.group.id}
      context="feedback"
      contextId={null}
      parent={null}
      depth={0}
    />
  </div>
</BasicSection>
