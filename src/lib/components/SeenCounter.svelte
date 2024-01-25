<script lang="ts">
  import { db, user } from '$lib/firebase';
  import type { CommentContext } from '$lib/models/comments';
  import type { Reaction, ReactionProps, ReactionTally } from '$lib/models/reactions';
  import { writeBatch, doc as fdoc, serverTimestamp, increment } from 'firebase/firestore';
  import { createEventDispatcher } from 'svelte';

  export let context: CommentContext;
  export let contextId: string;
  export let reactionPath: string;
  export let reaction: null | Reaction;
  export let tally: ReactionTally;

  const dispatch = createEventDispatcher();

  $: looking = false;

  async function handleClickSeen() {
    if (looking || reaction) return;
    looking = true;
    const reactionProps: ReactionProps = {
      context,
      context_id: contextId,
      reaction: null,
      reinforcement: null
    };
    const reactionRef = fdoc(db, reactionPath);
    const tallyRef = fdoc(db, tally.path);
    const batch = writeBatch(db);
    batch.set(reactionRef, {
      ...reactionProps,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    batch.update(tallyRef, {
      seen: increment(1),
      updated_at: serverTimestamp()
    });
    await batch.commit();
    dispatch('seen', {
      ...reactionProps,
      id: $user!.uid,
      path: reactionRef.path,
      created_at: new Date(),
      updated_at: new Date(),
      archived_at: null
    });
    looking = false;
  }
</script>

<button
  class="flex flex-row items-center btn btn-xs"
  class:btn-filled={!reaction}
  class:btn-neutral={!reaction}
  class:btn-primary={reaction}
  class:pointer-events-none={reaction}
  on:click={handleClickSeen}
>
  {#if looking}
    <div class="loading loading-xs loading-spinner" />
  {:else}
    <span class="material-symbols-outlined text-base">
      {reaction ? 'visibility' : 'visibility_off'}
    </span>
  {/if}
  {tally.seen}
</button>
