<script lang="ts">
  import { formatRelative } from 'date-fns';
  import type { Comment, CommentContext } from '$lib/models/comments';
  import {
    REACTIONS,
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
  let looking = false;

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
    await batch.commit();
  }

  async function unmarkAsSeen() {
    const batch = writeBatch(db);
    batch.delete(reactionRef);
    batch.update(commentRef, {
      seen: increment(-1)
    });
    await batch.commit();
  }

  let working = false;
  async function onClickSeen() {
    if (working) return;
    working = true;
    if (looking) {
      await unmarkAsSeen();
    } else {
      await markAsSeen();
    }
    looking = !looking;
    working = false;
  }

  let existingReaction: Reaction | null = null;
  onMount(async () => {
    const reactionDoc = await getDoc(reactionRef);
    if (reactionDoc.exists()) {
      existingReaction = {
        id: reactionDoc.id,
        ...(reactionDoc.data() as ReactionProps)
      };
    }
  });
</script>

<div class="card">
  <div class="card-body">
    <p>{comment.body}</p>
    <div>
      <small>
        {formatRelative(comment.created_at, now)}
      </small>
    </div>
    <div class="card-actions">
      {#if looking || existingReaction}
        <button on:click={onClickSeen}>Unsee</button>
      {:else}
        <button on:click={onClickSeen}>See</button>
      {/if}
      {#if looking || existingReaction}
        {#each reactionTypes as reactionType}
          <button>{REACTIONS[reactionType]}</button>
        {/each}
        {#each REENFORCEMENT_TYPES as reenforcementType}
          <button>{titleCase(reenforcementType)}</button>
        {/each}
      {/if}
    </div>
  </div>
</div>
