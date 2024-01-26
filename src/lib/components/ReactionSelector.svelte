<script lang="ts">
  import {
    REACTIONS,
    REINFORCEMENTS,
    REINFORCEMENT_TYPES,
    type Reaction,
    type ReactionTally,
    type ReactionType,
    type ReinforcementType
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

<div class="flex flex-row w-full">
  {#if tally}
    <div class="flex flex-row flex-wrap flex-1 justify-start items-end gap-1">
      {#each reactionTypes as reactionType}
        {#if tally[reactionType] > 0}
          <button
            title={titleCase(reactionType)}
            class="btn btn-xs pl-2 pr-1 py-0 gap-1"
            class:btn-outline={reaction.reaction === reactionType}
            class:btn-primary={reaction.reaction === reactionType}
            class:btn-ghost={reaction.reaction !== reactionType}
            on:click={handleClickReaction(reactionType)}
          >
            <span
              class="text-xs"
              class:text-neutral={reaction.reaction !== reactionType}
              class:text-base-content={reaction.reaction === reactionType}
            >
              {tally[reactionType]?.toLocaleString()}
            </span>
            <span class="text-base">
              {REACTIONS[reactionType]}
            </span>
          </button>
        {/if}
      {/each}

      <div class="flex flex-row flex-wrap justify-start items-end gap-1">
        {#each REINFORCEMENT_TYPES as reinforcementType}
          {#if reaction.reinforcement && tally[reinforcementType] > 0}
            <button
              title={titleCase(reinforcementType)}
              class="btn btn-xs rounded-full pl-2 pr-1 gap-2 btn-neutral"
              class:btn-error={reaction.reinforcement === reinforcementType &&
                reinforcementType === 'shun'}
              class:btn-warning={reaction.reinforcement === reinforcementType &&
                reinforcementType === 'demote'}
              class:btn-info={reaction.reinforcement === reinforcementType &&
                reinforcementType === 'promote'}
              class:btn-success={reaction.reinforcement === reinforcementType &&
                reinforcementType === 'endorse'}
              on:click={handleClickReinforcement(reinforcementType)}
            >
              <span class="text-xs">
                {tally[reinforcementType]}
              </span>
              <span class="material-symbols-outlined text-base">
                {REINFORCEMENTS[reinforcementType]}
              </span>
            </button>
          {/if}
        {/each}
      </div>
    </div>
  {/if}

  {#if reaction}
    <div class="flex flex-row gap-1">
      {#if !reaction.reinforcement}
        <div class="dropdown dropdown-bottom dropdown-end">
          <div
            title="Add reinforcement"
            role="button"
            tabindex="0"
            class="btn btn-circle btn-sm btn-primary text-xl"
          >
            <span class="material-symbols-outlined">thumbs_up_down</span>
          </div>
          <ul
            class="dropdown-content z-40 shadow bg-base-300 flex flex-row flex-wrap justify-center align-center gap-1 rounded-box p-1"
            style:width="10rem"
          >
            {#each REINFORCEMENT_TYPES as reinforcementType}
              <li>
                <button
                  title={titleCase(reinforcementType)}
                  class="btn btn-sm rounded-full px-1"
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
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if !reaction.reaction}
        <div class="dropdown dropdown-bottom dropdown-end">
          <div
            title="Add reaction"
            role="button"
            tabindex="0"
            class="btn btn-circle btn-sm btn-secondary text-xl"
          >
            <span class="material-symbols-outlined">add_reaction</span>
          </div>
          <ul
            class="dropdown-content z-40 shadow bg-base-300 flex flex-row flex-wrap justify-center align-center gap-1 rounded-box p-1"
            style:width="16rem"
          >
            {#each reactionTypes as reactionType}
              <li>
                <button
                  title={titleCase(reactionType)}
                  on:click={handleClickReaction(reactionType)}
                  class="btn btn-circle btn-sm text-xl"
                >
                  {REACTIONS[reactionType]}
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  {/if}
</div>
