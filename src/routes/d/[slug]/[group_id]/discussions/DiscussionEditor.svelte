<script lang="ts">
  import { doc as fdoc, updateDoc } from 'firebase/firestore';
  import BlocksEditor from '$lib/components/BlocksEditor.svelte';
  import { db, docStore, user } from '$lib/firebase';
  import type { Block } from '$lib/models/blocks';
  import type { Discussion } from '$lib/models/discussions';
  import { formatRelative } from 'date-fns';
  import { workingCallback } from '$lib/stores/working';
  import { enhance } from '$app/forms';
  import ProfileLink from '$lib/components/ProfileLink.svelte';

  export let discussion: Discussion;
  let doc = docStore<Discussion>(discussion.path);

  $: blocks = [...($doc?.blocks ?? discussion.blocks)];

  $: state = $doc ? $doc.state : discussion.state;
  $: ownerId = discussion.user_id;

  $: editable = state === 'draft';
  $: isOpen = state === 'open';
  $: ownsDiscussion = $user!.uid === ownerId;

  let dropModal: HTMLDialogElement;

  async function saveBlocks(blocks: Block[]) {
    let nextBlocks = blocks.slice();
    if (!nextBlocks.length) {
      nextBlocks = [{ uid: crypto.randomUUID(), content: '', type: 'text' }];
    }
    await updateDoc(fdoc(db, discussion.path), { blocks: nextBlocks });
  }
</script>

<div class="flex flex-col items-center">
  <div class="card bg-base-200 max-w-3xl w-full rounded-box">
    <div
      class="card-title text-xs font-semibold bg-base-300 pl-4 pr-2 py-2 rounded-box"
      style:border-bottom-left-radius="0"
      style:border-bottom-right-radius="0"
    >
      <h3 class="flex-1">
        Created by
        <ProfileLink handle={discussion.profile_handle} />
        {formatRelative(discussion.created_at, new Date())}
      </h3>
      <span
        class="text-xs rounded-full py-1 px-2"
        class:bg-info={state === 'draft'}
        class:bg-success={state === 'open'}
        class:bg-warning={state === 'dropped'}
        class:bg-error={state === 'archived'}
      >
        {state}
      </span>
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
      <BlocksEditor {editable} {blocks} {saveBlocks} />

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
    </div>
  </div>
</div>

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
