<script lang="ts">
  import SvelteMarkdown from 'svelte-markdown';
  import { inview } from 'svelte-inview';
  import { formatRelative } from 'date-fns';
  import type { Comment, CommentContext, CommentProps } from '$lib/models/comments';
  import {
    REACTIONS,
    REENFORCEMENTS,
    REENFORCEMENT_TYPES,
    type Reaction,
    type ReactionProps,
    type ReactionType,
    type ReenforcementType
  } from '$lib/models/reactions';
  import { titleCase } from '$lib/utils/string';
  import {
    QueryDocumentSnapshot,
    Timestamp,
    doc,
    getDoc,
    increment,
    onSnapshot,
    serverTimestamp,
    writeBatch,
    type DocumentData
  } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  export let document: QueryDocumentSnapshot<DocumentData, CommentProps>;
  export let context: CommentContext;
  export let contextId: string;
  export let userId: string;

  const reactionTypes = Object.keys(REACTIONS) as ReactionType[];
  let now = new Date();

  let comment: Comment;
  $: comment = {
    id: document.id,
    path: document.ref.path,
    ...(document.data() as CommentProps),
    created_at: document.data().created_at?.toDate()
  };
  $: liveComment = { ...comment };
  $: isAnonymous = liveComment.user_id === null;
  $: existingReaction = null as Reaction | null;
  $: thisReaction = existingReaction?.reaction;
  $: thisReenforcement = existingReaction?.reenforcement;

  $: commentRef = doc(db, liveComment.path);
  $: reactionRef = doc(
    db,
    'organizations',
    liveComment.organization_id,
    'groups',
    liveComment.group_id,
    'feedback',
    liveComment.id,
    'reactions',
    userId
  );

  $: working = false;

  let unsubscribe: undefined | (() => void);
  $: unsubscribe = undefined;

  onMount(() => {
    return () => teardown();
  });

  async function setup() {
    if (unsubscribe) {
      unsubscribe();
    }
    unsubscribe = onSnapshot(commentRef, function onNext(snapshot) {
      liveComment = {
        ...liveComment,
        ...snapshot.data(),
        created_at: (snapshot.data()?.created_at as Timestamp).toDate()
      };
    });
    const reactionDoc = await getDoc(reactionRef);
    if (reactionDoc.exists()) {
      existingReaction = {
        id: reactionDoc.id,
        ...(reactionDoc.data() as ReactionProps)
      };
    } else {
      existingReaction = null;
    }
  }

  function teardown() {
    if (unsubscribe) {
      unsubscribe();
    }
  }

  async function markAsSeen() {
    const reactionProps: Omit<ReactionProps, 'created_at'> = {
      context,
      context_id: contextId,
      reaction: null,
      reenforcement: null
    };
    const batch = writeBatch(db);
    batch.set(reactionRef, {
      ...reactionProps,
      created_at: serverTimestamp()
    });
    batch.update(commentRef, {
      seen: increment(1)
    });
    working = true;
    await batch.commit();
    existingReaction = {
      id: userId,
      ...reactionProps,
      created_at: new Date()
    };
    working = false;
  }

  async function onClickSeen() {
    if (working) return;
    working = true;
    if (!existingReaction) {
      await markAsSeen();
    }
    working = false;
  }

  function handleClickReaction(reactionType: ReactionType) {
    return async () => {
      const batch = writeBatch(db);
      if (existingReaction?.reaction && existingReaction?.reaction === reactionType) {
        // console.log('unreacting');
        batch.update(commentRef, { [existingReaction.reaction]: increment(-1) });
        batch.update(reactionRef, { reaction: null });
        existingReaction.reaction = null;
      } else if (existingReaction?.reaction) {
        // console.log('changing reaction');
        batch.update(commentRef, {
          [reactionType]: increment(1),
          [existingReaction.reaction]: increment(-1)
        });
        batch.update(reactionRef, { reaction: reactionType });
        existingReaction.reaction = reactionType;
      } else if (existingReaction) {
        // console.log('adding reaction');
        batch.update(commentRef, { [reactionType]: increment(1) });
        batch.update(reactionRef, { reaction: reactionType });
        existingReaction.reaction = reactionType;
      }
      await batch.commit();
    };
  }

  function handleClickReenforcement(reenforcementType: ReenforcementType) {
    return async () => {
      const batch = writeBatch(db);
      if (
        existingReaction?.reenforcement &&
        existingReaction?.reenforcement === reenforcementType
      ) {
        // console.log('unreenforcing');
        batch.update(commentRef, { [existingReaction.reenforcement]: increment(-1) });
        batch.update(reactionRef, { reenforcement: null });
        existingReaction.reenforcement = null;
      } else if (existingReaction?.reenforcement) {
        // console.log('changing reenforcement');
        batch.update(commentRef, {
          [reenforcementType]: increment(1),
          [existingReaction.reenforcement]: increment(-1)
        });
        batch.update(reactionRef, { reenforcement: reenforcementType });
        existingReaction.reenforcement = reenforcementType;
      } else if (existingReaction) {
        // console.log('adding reenforcement');
        batch.update(commentRef, { [reenforcementType]: increment(1) });
        batch.update(reactionRef, { reenforcement: reenforcementType });
        existingReaction.reenforcement = reenforcementType;
      }
      await batch.commit();
    };
  }
</script>

<div
  class="card card-bordered bg-base-200 rounded-md w-full"
  use:inview
  on:inview_enter={() => setup()}
  on:inview_leave={() => teardown()}
>
  <div class="card-body p-6">
    <div class="flex items-center">
      <small class="text-left text-neutral flex-1">
        {#if isAnonymous}
          anonymous
        {:else}
          <a href={`/d/profiles/${liveComment.user_handle}`} class="link text-primary">
            @{liveComment.user_handle}
          </a>
        {/if}
        said
        {formatRelative(liveComment.created_at, now)}
      </small>

      <div class="flex flex-col pl-2">
        <button
          class="flex flex-row items-center btn btn-xs"
          class:btn-filled={!existingReaction}
          class:btn-neutral={!existingReaction}
          class:btn-primary={existingReaction}
          class:pointer-events-none={existingReaction}
          on:click={onClickSeen}
        >
          {#if working}
            <div class="loading loading-xs loading-spinner" />
          {:else}
            <span class="material-symbols-outlined text-base">
              {existingReaction ? 'visibility' : 'visibility_off'}
            </span>
          {/if}
          {liveComment.seen}
        </button>
      </div>
    </div>

    <p class="comment-body text-base w-full">
      {#if liveComment.body}
        <SvelteMarkdown source={liveComment.body} />
      {/if}
    </p>

    {#if existingReaction}
      <div class="flex flex-col items-end gap-2 pt-2">
        <div class="flex flex-row-reverse flex-wrap" in:fade={{ duration: 300 }}>
          {#each reactionTypes as reactionType}
            {#if thisReaction && liveComment[reactionType] > 0}
              <span
                class="flex items-center border-2 rounded-full pr-2"
                class:border-base-300={thisReaction !== reactionType}
                class:border-accent={thisReaction === reactionType}
              >
                <button
                  title={titleCase(reactionType)}
                  class="btn btn-sm btn-circle btn-ghost text-xl"
                  on:click={handleClickReaction(reactionType)}
                >
                  {REACTIONS[reactionType]}
                </button>
                <span
                  class:text-neutral={thisReaction !== reactionType}
                  class:text-base-content={thisReaction === reactionType}
                  class="text-sm"
                >
                  {liveComment[reactionType]?.toLocaleString()}
                </span>
              </span>
            {:else}
              <span
                class="flex flex-row-reverse items-center border-2 border-base-200 rounded-full"
              >
                <button
                  title={titleCase(reactionType)}
                  class="btn btn-sm text-xl btn-circle btn-ghost opacity-80 hover:opacity-100"
                  on:click={handleClickReaction(reactionType)}
                >
                  {REACTIONS[reactionType]}
                </button>
              </span>
            {/if}
          {/each}
        </div>

        <div class="flex flex-row-reverse gap-1" in:fade={{ duration: 300, delay: 150 }}>
          {#each REENFORCEMENT_TYPES as reenforcementType}
            {#if thisReenforcement && liveComment[reenforcementType] > 0}
              <button
                title={titleCase(reenforcementType)}
                class="btn btn-sm"
                class:btn-outline={thisReenforcement !== reenforcementType}
                class:btn-error={reenforcementType === 'shun'}
                class:btn-warning={reenforcementType === 'demote'}
                class:btn-info={reenforcementType === 'promote'}
                class:btn-success={reenforcementType === 'endorse'}
                on:click={handleClickReenforcement(reenforcementType)}
              >
                <span class="material-symbols-outlined">
                  {REENFORCEMENTS[reenforcementType]}
                </span>
                <span>
                  {liveComment[reenforcementType]}
                </span>
              </button>
            {:else}
              <button
                title={titleCase(reenforcementType)}
                class="btn btn-sm btn-circle opacity-80 hover:opacity-100 text-base-content"
                class:btn-outline={thisReenforcement !== reenforcementType}
                class:btn-error={reenforcementType === 'shun'}
                class:btn-warning={reenforcementType === 'demote'}
                class:btn-info={reenforcementType === 'promote'}
                class:btn-success={reenforcementType === 'endorse'}
                on:click={handleClickReenforcement(reenforcementType)}
              >
                <span class="material-symbols-outlined">
                  {REENFORCEMENTS[reenforcementType]}
                </span>
              </button>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
