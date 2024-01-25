<script lang="ts">
  import {
    REACTIONS,
    type Reaction,
    type ReactionTally,
    type ReactionType
  } from '$lib/models/reactions';
  import { titleCase } from '$lib/utils/string';
  import { doc as fdoc, increment, serverTimestamp, writeBatch } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { createEventDispatcher } from 'svelte';

  export let reaction: Reaction;
  export let tally: ReactionTally;

  const reactionTypes = Object.keys(REACTIONS) as ReactionType[];
  const dispatch = createEventDispatcher();

  function handleClickReaction(reactionType: ReactionType) {
    return async () => {
      const reactionRef = fdoc(db, reaction.path);
      const tallyRef = fdoc(db, tally.path);

      const batch = writeBatch(db);
      if (reaction.reaction && reaction.reaction === reactionType) {
        // console.log('unreacting');
        batch.update(tallyRef, {
          [reaction.reaction]: increment(-1),
          updated_at: serverTimestamp()
        });
        batch.update(reactionRef, {
          reaction: null,
          updated_at: serverTimestamp()
        });
        reaction.reaction = null;
      } else if (reaction.reaction) {
        // console.log('changing reaction');
        batch.update(tallyRef, {
          [reactionType]: increment(1),
          [reaction.reaction]: increment(-1),
          updated_at: serverTimestamp()
        });
        batch.update(reactionRef, {
          reaction: reactionType,
          updated_at: serverTimestamp()
        });
        reaction.reaction = reactionType;
      } else if (reaction) {
        // console.log('adding reaction');
        batch.update(tallyRef, {
          [reactionType]: increment(1),
          updated_at: serverTimestamp()
        });
        batch.update(reactionRef, {
          reaction: reactionType,
          updated_at: serverTimestamp()
        });
        reaction.reaction = reactionType;
      }
      await batch.commit();
      dispatch('reacted', reaction);
    };
  }
</script>

{#if tally}
  <div class="flex flex-row-reverse flex-wrap">
    {#each reactionTypes as reactionType}
      {#if reaction.reaction && tally[reactionType] > 0}
        <span
          class="flex items-center border-2 rounded-full pr-2"
          class:border-base-300={reaction.reaction !== reactionType}
          class:border-accent={reaction.reaction === reactionType}
        >
          <button
            title={titleCase(reactionType)}
            class="btn btn-sm btn-circle btn-ghost text-xl"
            on:click={handleClickReaction(reactionType)}
          >
            {REACTIONS[reactionType]}
          </button>
          <span
            class:text-neutral={reaction.reaction !== reactionType}
            class:text-base-content={reaction.reaction === reactionType}
            class="text-sm"
          >
            {tally[reactionType]?.toLocaleString()}
          </span>
        </span>
      {:else}
        <span class="flex flex-row-reverse items-center border-2 border-base-200 rounded-full">
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
{/if}
