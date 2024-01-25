<script lang="ts">
  import { db } from '$lib/firebase';
  import {
    REINFORCEMENTS,
    REINFORCEMENT_TYPES,
    type Reaction,
    type ReactionTally,
    type ReinforcementType
  } from '$lib/models/reactions';
  import { titleCase } from '$lib/utils/string';
  import { doc as fdoc, increment, serverTimestamp, writeBatch } from 'firebase/firestore';
  import { createEventDispatcher } from 'svelte';

  export let reaction: Reaction;
  export let tally: ReactionTally;

  const dispatch = createEventDispatcher();

  function handleClickReinforcement(reinforcementType: ReinforcementType) {
    return async () => {
      const reactionRef = fdoc(db, reaction.path);
      const tallyRef = fdoc(db, tally.path);

      const batch = writeBatch(db);
      if (reaction.reinforcement && reaction.reinforcement === reinforcementType) {
        // console.log('unreinforcing');
        batch.update(tallyRef, {
          [reaction.reinforcement]: increment(-1),
          updated_at: serverTimestamp()
        });
        batch.update(reactionRef, {
          reinforcement: null,
          updated_at: serverTimestamp()
        });
        reaction.reinforcement = null;
      } else if (reaction.reinforcement) {
        // console.log('changing reinforcement');
        batch.update(tallyRef, {
          [reinforcementType]: increment(1),
          [reaction.reinforcement]: increment(-1),
          updated_at: serverTimestamp()
        });
        batch.update(reactionRef, {
          reinforcement: reinforcementType,
          updated_at: serverTimestamp()
        });
        reaction.reinforcement = reinforcementType;
      } else if (reaction) {
        // console.log('adding reinforcement');
        batch.update(tallyRef, {
          [reinforcementType]: increment(1),
          updated_at: serverTimestamp()
        });
        batch.update(reactionRef, {
          reinforcement: reinforcementType,
          updated_at: serverTimestamp()
        });
        reaction.reinforcement = reinforcementType;
      }
      await batch.commit();
      dispatch('reacted', reaction);
    };
  }
</script>

{#if reaction}
  <div class="flex flex-row-reverse gap-1">
    {#each REINFORCEMENT_TYPES as reinforcementType}
      {#if reaction.reinforcement && tally[reinforcementType] > 0}
        <button
          title={titleCase(reinforcementType)}
          class="btn btn-sm rounded-full"
          class:btn-outline={reaction.reinforcement !== reinforcementType}
          class:btn-error={reinforcementType === 'shun'}
          class:btn-warning={reinforcementType === 'demote'}
          class:btn-info={reinforcementType === 'promote'}
          class:btn-success={reinforcementType === 'endorse'}
          on:click={handleClickReinforcement(reinforcementType)}
        >
          <span class="material-symbols-outlined">
            {REINFORCEMENTS[reinforcementType]}
          </span>
          <span>
            {tally[reinforcementType]}
          </span>
        </button>
      {:else}
        <button
          title={titleCase(reinforcementType)}
          class="btn btn-sm btn-circle opacity-80 hover:opacity-100 text-base-content"
          class:btn-outline={reaction.reinforcement !== reinforcementType}
          class:btn-error={reinforcementType === 'shun'}
          class:btn-warning={reinforcementType === 'demote'}
          class:btn-info={reinforcementType === 'promote'}
          class:btn-success={reinforcementType === 'endorse'}
          on:click={handleClickReinforcement(reinforcementType)}
        >
          <span class="material-symbols-outlined">
            {REINFORCEMENTS[reinforcementType]}
          </span>
        </button>
      {/if}
    {/each}
  </div>
{/if}
