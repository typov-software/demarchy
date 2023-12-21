<script lang="ts">
  import { formatRelative } from 'date-fns';
  import type { Comment, CommentContext } from '$lib/models/comments';
  import {
    REACTIONS,
    REENFORCEMENTS,
    REENFORCEMENT_TYPES,
    type Reaction,
    type ReactionProps,
    type ReactionType
  } from '$lib/models/reactions';
  import { titleCase } from '$lib/utils/string';
  import { doc, getDoc, increment, serverTimestamp, writeBatch } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { onMount } from 'svelte';

  export let comment: Comment;
  export let context: CommentContext;
  export let contextId: string;
  export let userId: string;

  const reactionTypes = Object.keys(REACTIONS) as ReactionType[];
  let now = new Date();
  let working = false;
  let existingReaction: Reaction | null = null;
  let isAnonymous = comment.user_id === null;

  const commentRef = doc(db, comment.path);
  const reactionRef = doc(
    db,
    'organizations',
    comment.organization_id,
    'groups',
    comment.group_id,
    'feedback',
    comment.id,
    'reactions',
    userId
  );

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

  async function unmarkAsSeen() {
    const batch = writeBatch(db);
    batch.delete(reactionRef);
    batch.update(commentRef, { seen: increment(-1) });
    working = true;
    await batch.commit();
    existingReaction = null;
    working = false;
  }

  async function onClickSeen() {
    if (working) return;
    working = true;
    if (existingReaction) {
      await unmarkAsSeen();
    } else {
      await markAsSeen();
    }
    working = false;
  }

  onMount(async () => {
    const reactionDoc = await getDoc(reactionRef);
    if (reactionDoc.exists()) {
      existingReaction = {
        id: reactionDoc.id,
        ...(reactionDoc.data() as ReactionProps)
      };
    }
  });

  function handleClickReaction(reactionType: ReactionType) {
    return async () => {
      const batch = writeBatch(db);
      if (existingReaction?.reaction && existingReaction?.reaction === reactionType) {
        // Removing reaction
        console.log('unreacting');
        batch.update(commentRef, { [existingReaction.reaction]: increment(-1) });
        batch.update(reactionRef, { reaction: null });
      } else if (existingReaction?.reaction) {
        // Changing reaction
        console.log('changing reaction');
        batch.update(commentRef, {
          [reactionType]: increment(1),
          [existingReaction.reaction]: increment(-1)
        });
        batch.update(reactionRef, { reaction: reactionType });
      } else {
        // Adding reaction
        console.log('adding reaction');
        batch.update(commentRef, { [reactionType]: increment(1) });
        batch.update(reactionRef, { reaction: reactionType });
      }
      await batch.commit();
    };
  }
</script>

<div class="card card-bordered w-full bg-base-200">
  <div class="card-body">
    <p>{comment.body}</p>
    <div class="card-actions flex flex-col pt-2">
      <div class="flex flex-row items-center w-full">
        <span class="flex items-center gap-2 mr-2">
          <button class="btn btn-sm btn-ghost btn-circle" on:click={onClickSeen}>
            <span class="material-symbols-outlined text-xl">
              {existingReaction ? 'visibility_off' : 'visibility'}
            </span>
          </button>
          {comment.seen}
        </span>
        <div class="flex flex-1" />

        <small>
          by
          {#if isAnonymous}
            anonymous
          {:else}
            <a href={`/d/profiles/${comment.user_handle}`} class="link text-info">
              @{comment.user_handle}
            </a>
          {/if}
          {formatRelative(comment.created_at, now)}
        </small>
      </div>

      {#if existingReaction}
        <div class="flex flex-wrap gap-1">
          {#each reactionTypes as reactionType}
            <button
              title={titleCase(reactionType)}
              class="btn btn-sm text-xl btn-ghost btn-circle"
              on:click={handleClickReaction(reactionType)}
            >
              {REACTIONS[reactionType]}
            </button>
          {/each}
        </div>
        <div class="flex gap-1">
          {#each REENFORCEMENT_TYPES as reenforcementType}
            <button
              title={titleCase(reenforcementType)}
              class="btn btn-sm btn-circle btn-ghost"
              class:text-error={reenforcementType === 'shun'}
              class:text-warning={reenforcementType === 'demote'}
              class:text-info={reenforcementType === 'promote'}
              class:text-success={reenforcementType === 'endorse'}
            >
              <span class="material-symbols-outlined">
                {REENFORCEMENTS[reenforcementType]}
              </span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
