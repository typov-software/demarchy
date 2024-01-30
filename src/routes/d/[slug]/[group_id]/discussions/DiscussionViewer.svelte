<script lang="ts">
  import { doc as fdoc } from 'firebase/firestore';
  import BlocksEditor from '$lib/components/BlocksEditor.svelte';
  import { db, docStore, user } from '$lib/firebase';
  import type { Discussion } from '$lib/models/discussions';
  import { formatRelative } from 'date-fns';
  import { workingCallback } from '$lib/stores/working';
  import { enhance } from '$app/forms';
  import { type Reaction, type ReactionTally } from '$lib/models/reactions';
  import SeenCounter from '$lib/components/SeenCounter.svelte';
  import { fade } from 'svelte/transition';
  import ReactionSelector from '$lib/components/ReactionSelector.svelte';
  import ThreadedReplies from '$lib/components/ThreadedReplies.svelte';
  import ProfileLink from '$lib/components/ProfileLink.svelte';

  export let discussion: Discussion;

  $: editable = discussion.state === 'draft';
  $: isOpen = discussion.state === 'open';
  $: ownsDiscussion = $user!.uid === discussion.user_id;

  // Sub doc refs
  let reactionPath = `/organizations/${discussion.organization_id}/groups/${
    discussion.group_id
  }/discussions/${discussion.id}/reactions/${$user!.uid}`;

  let reactionRef = fdoc(db, reactionPath);
  let tallyRef = fdoc(
    db,
    `/organizations/${discussion.organization_id}/groups/${discussion.group_id}/discussions/${discussion.id}/tallies/reactions`
  );

  let reactionDoc = docStore<Reaction>(reactionRef.path);
  $: reaction = $reactionDoc;

  let tallyDoc = docStore<ReactionTally>(tallyRef.path);
  $: tally = $tallyDoc;

  // Modal refs
  let dropModal: HTMLDialogElement;
</script>

<div class="flex flex-col items-center">
  <div class="card bg-base-200 max-w-3xl w-full rounded-box">
    <div
      class="card-title text-xs font-semibold bg-base-300 pl-4 pr-2 py-2 rounded-box"
      style:border-bottom-left-radius="0"
      style:border-bottom-right-radius="0"
    >
      <h3 class="flex-1 w-full">
        Created by
        <ProfileLink handle={discussion.profile_handle} />
        {formatRelative(discussion.created_at, new Date())}
      </h3>
      <span
        class="text-xs rounded-full py-1 px-2"
        class:bg-info={discussion.state === 'draft'}
        class:bg-success={discussion.state === 'open'}
        class:bg-warning={discussion.state === 'dropped'}
        class:bg-error={discussion.state === 'archived'}
      >
        {discussion.state}
      </span>
      {#if isOpen && tally}
        <SeenCounter
          context="discussions"
          contextId={discussion.id}
          {reactionPath}
          {reaction}
          {tally}
        />
      {/if}
      {#if editable}
        <button class="btn btn-square btn-sm btn-ghost">
          <span class="material-symbols-outlined">draft</span>
        </button>
      {/if}
      {#if ownsDiscussion && isOpen && !editable}
        <div class="dropdown dropdown-bottom dropdown-end">
          <button class="btn btn-square btn-sm"
            ><span class="material-symbols-outlined">more_vert</span></button
          >
          <ul class="dropdown-content w-60 menu z-[1] shadow bg-base-100 rounded-box">
            <li>
              <button
                class="flex items-center gap-2 text-warning w-full flex-1"
                on:click={() => dropModal?.showModal()}
              >
                <span class="material-symbols-outlined">undo</span>
                Close discussion</button
              >
            </li>
          </ul>
        </div>
      {/if}
    </div>
    <div class="card-body px-0 py-2 gap-0">
      <BlocksEditor editable={false} blocks={discussion.blocks} />

      {#if editable && ownsDiscussion}
        <div class="card-actions pt-4 pb-2 px-4">
          <div class="flex-1" />
          <form method="post" action="?/openDiscussion" use:enhance={workingCallback()}>
            <input type="hidden" name="path" value={discussion.path} />
            <button class="btn btn-success btn-sm">
              <span class="material-symbols-outlined">present_to_all</span>
              Open Discussion
            </button>
          </form>
        </div>
      {/if}

      {#if reaction && tally}
        <div class="flex flex-col items-end gap-2 p-3" in:fade={{ duration: 300 }}>
          <ReactionSelector {reaction} {tally} />
        </div>
      {/if}
    </div>
  </div>
</div>

{#if reaction && tally}
  <ThreadedReplies
    organizationId={discussion.organization_id}
    groupId={discussion.group_id}
    contextId={discussion.id}
    context="discussions"
  />
{/if}

<dialog id="close-proposal" class="modal" bind:this={dropModal}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">Warning</h3>
    <p class="py-4">Are you sure you want to drop this discussion?</p>

    <div class="flex justify-end gap-2">
      <button class="btn btn-info" on:click={() => dropModal.close()}>No, keep it open</button>
      <form
        method="post"
        action="?/dropDiscussion"
        use:enhance={workingCallback({
          onStart() {
            dropModal?.close();
          },
          reset: true
        })}
      >
        <input type="hidden" name="path" value={discussion.path} />
        <button class="btn btn-error btn-outline">I'm sure, drop it</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
