<script lang="ts">
  import { inview } from 'svelte-inview';
  import { formatRelative } from 'date-fns';
  import type { Comment, CommentContext } from '$lib/models/comments';
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
    doc,
    getDoc,
    increment,
    onSnapshot,
    writeBatch,
    serverTimestamp
  } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { makeDocument } from '$lib/models/utils';
  import BlocksEditor from './BlocksEditor.svelte';

  export let comment: Comment;
  export let context: CommentContext;
  export let contextId: string;
  export let userId: string;

  const reactionTypes = Object.keys(REACTIONS) as ReactionType[];
  let now = new Date();

  let liveComment: Comment = { ...comment };
  $: liveComment;
  $: isAnonymous = liveComment.user_id === null;
  let existingReaction: null | Reaction;
  $: existingReaction = null;
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
      liveComment = makeDocument<Comment>(snapshot);
    });
    const reactionDoc = await getDoc(reactionRef);
    if (reactionDoc.exists()) {
      existingReaction = makeDocument<Reaction>(reactionDoc);
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
    const reactionProps: ReactionProps = {
      context,
      context_id: contextId,
      reaction: null,
      reenforcement: null
    };
    const batch = writeBatch(db);
    batch.set(reactionRef, {
      ...reactionProps,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    batch.update(commentRef, {
      seen: increment(1),
      updated_at: serverTimestamp()
    });
    working = true;
    await batch.commit();
    existingReaction = {
      ...reactionProps,
      id: userId,
      path: reactionRef.path,
      created_at: new Date(),
      updated_at: new Date(),
      archived_at: null
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
        batch.update(commentRef, {
          [existingReaction.reaction]: increment(-1),
          updated_at: serverTimestamp()
        });
        batch.update(reactionRef, { reaction: null, updated_at: serverTimestamp() });
        existingReaction.reaction = null;
      } else if (existingReaction?.reaction) {
        // console.log('changing reaction');
        batch.update(commentRef, {
          [reactionType]: increment(1),
          [existingReaction.reaction]: increment(-1),
          updated_at: serverTimestamp()
        });
        batch.update(reactionRef, { reaction: reactionType, updated_at: serverTimestamp() });
        existingReaction.reaction = reactionType;
      } else if (existingReaction) {
        // console.log('adding reaction');
        batch.update(commentRef, { [reactionType]: increment(1), updated_at: serverTimestamp() });
        batch.update(reactionRef, { reaction: reactionType, updated_at: serverTimestamp() });
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
        batch.update(commentRef, {
          [existingReaction.reenforcement]: increment(-1),
          updated_at: serverTimestamp()
        });
        batch.update(reactionRef, { reenforcement: null, updated_at: serverTimestamp() });
        existingReaction.reenforcement = null;
      } else if (existingReaction?.reenforcement) {
        // console.log('changing reenforcement');
        batch.update(commentRef, {
          [reenforcementType]: increment(1),
          [existingReaction.reenforcement]: increment(-1),
          updated_at: serverTimestamp()
        });
        batch.update(reactionRef, {
          reenforcement: reenforcementType,
          updated_at: serverTimestamp()
        });
        existingReaction.reenforcement = reenforcementType;
      } else if (existingReaction) {
        // console.log('adding reenforcement');
        batch.update(commentRef, {
          [reenforcementType]: increment(1),
          updated_at: serverTimestamp()
        });
        batch.update(reactionRef, {
          reenforcement: reenforcementType,
          updated_at: serverTimestamp()
        });
        existingReaction.reenforcement = reenforcementType;
      }
      await batch.commit();
    };
  }
</script>

<div
  class="card bg-base-200 w-full"
  use:inview
  on:inview_enter={() => setup()}
  on:inview_leave={() => teardown()}
>
  <div class="card-body py-3 px-0">
    <div class="flex items-center pr-3 pl-4">
      <small class="text-left text-neutral flex-1">
        {#if isAnonymous}
          anonymous
        {:else}
          <a href={`/d/profiles/${liveComment.user_handle}`} class="link text-primary">
            @{liveComment.user_handle}
          </a>
        {/if}
        said
        {liveComment.created_at ? formatRelative(liveComment.created_at, now) : ''}
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

    <div class:mb-2={!existingReaction}>
      <BlocksEditor blocks={liveComment.blocks ?? []} editable={false} />
    </div>

    {#if existingReaction}
      <div class="flex flex-col items-end gap-2 px-3">
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
