<script lang="ts">
  import { inview } from 'svelte-inview';
  import { formatRelative } from 'date-fns';
  import type { Comment, CommentContext } from '$lib/models/comments';
  import { type Reaction, type ReactionTally } from '$lib/models/reactions';
  import { doc as fdoc, getDoc, onSnapshot } from 'firebase/firestore';
  import { db, user } from '$lib/firebase';
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { makeDocument } from '$lib/models/utils';
  import BlocksEditor from './BlocksEditor.svelte';
  import ReactionSelector from './ReactionSelector.svelte';
  import SeenCounter from './SeenCounter.svelte';
  import ProfileLink from './ProfileLink.svelte';

  const dispatch = createEventDispatcher();

  export let comment: Comment;
  export let context: CommentContext;
  export let contextId: string;
  export let threaded = false;
  export let highlighted = false;
  export let pinnable = false;

  let userId = $user!.uid;
  let isOwner = userId === comment.user_id;
  let now = new Date();

  let tally: null | ReactionTally = null;
  $: tally;
  $: tallyPath = `${comment.path}/tallies/reactions`;
  $: tallyRef = fdoc(db, tallyPath);

  $: isAnonymous = comment.user_id === null;

  let reaction: null | Reaction = null;
  $: reaction;
  $: reactionPath = `${comment.path}/reactions/${userId}`;
  $: reactionRef = fdoc(db, reactionPath);

  let disposers: Array<() => void> = [];
  $: disposers;

  onMount(() => {
    return () => teardown();
  });

  async function setup() {
    teardown();
    disposers = [
      onSnapshot(tallyRef, function onNext(snapshot) {
        tally = makeDocument<ReactionTally>(snapshot);
      }),
    ];
    // We only need to fetch the reaction document once and don't need to subscribe to live updates done by the user
    if (!reaction) {
      const reactionDoc = await getDoc(reactionRef);
      if (reactionDoc.exists()) {
        reaction = makeDocument<Reaction>(reactionDoc);
      } else {
        reaction = null;
      }
    }
  }

  function teardown() {
    for (let unsubscribe of disposers) {
      unsubscribe();
    }
    disposers = [];
  }
</script>

<div
  class="card bg-base-200 w-full"
  class:bg-base-300={highlighted}
  use:inview
  on:inview_enter={() => setup()}
  on:inview_leave={() => teardown()}
>
  <div class="card-body py-3 px-0">
    <div class="flex items-center pr-3 pl-4">
      <small class="text-left text-neutral flex-1">
        {#if isAnonymous}
          anonymous
        {:else if comment.profile_handle}
          <ProfileLink handle={comment.profile_handle} />
        {/if}
        said
        {comment.created_at ? formatRelative(comment.created_at, now) : ''}
      </small>

      <div class="flex pl-2 gap-2">
        {#if tally}
          <SeenCounter
            {context}
            {contextId}
            {reactionPath}
            {reaction}
            {tally}
            on:seen={(r) => (reaction = r.detail)}
          />
          {#if threaded && reaction}
            <button class="btn btn-xs btn-neutral" on:click={() => dispatch('reply', { comment })}>
              {tally.replies || ''}
              <span class="material-symbols-outlined">reply</span>
            </button>
          {/if}
        {/if}
        {#if isOwner}
          <div class="dropdown dropdown-end">
            <div
              tabindex="0"
              role="button"
              class="btn btn-xs btn-outline border-neutral hover:bg-neutral hover:border-neutral"
            >
              <span class="material-symbols-outlined">more_horiz</span>
            </div>
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <ul
              tabindex="0"
              class="dropdown-content menu w-72 z-[1] shadow rounded-box"
              class:bg-base-200={highlighted}
              class:bg-base-300={!highlighted}
            >
              {#if pinnable}
                <li>
                  <button
                    class="hover:text-warning"
                    on:click={() => dispatch('pin:clarification', comment)}
                  >
                    <span class="material-symbols-outlined">push_pin</span>
                    Pin for Clarification
                  </button>
                </li>
                <li>
                  <button
                    class="hover:text-warning"
                    on:click={() => dispatch('pin:concern', comment)}
                  >
                    <span class="material-symbols-outlined">push_pin</span>
                    Pin as Concern
                  </button>
                </li>
              {/if}
            </ul>
          </div>
        {/if}
      </div>
    </div>

    <div class:mb-2={!reaction}>
      <BlocksEditor blocks={comment.blocks ?? []} editable={false} />
    </div>

    {#if reaction && tally}
      <div class="flex flex-col items-end gap-2 px-3" in:fade={{ duration: 300 }}>
        <ReactionSelector {reaction} {tally} />
      </div>
    {/if}
  </div>
</div>
