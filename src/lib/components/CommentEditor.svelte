<script lang="ts">
  import type { Block } from '$lib/models/blocks';
  import { doc, collection, serverTimestamp, writeBatch } from 'firebase/firestore';
  import BlocksEditor from './BlocksEditor.svelte';
  import { db } from '$lib/firebase';
  import type { CommentContext, CommentProps } from '$lib/models/comments';
  import {
    createEmptyReactions,
    createEmptyReinforcements,
    type ReactionTallyProps
  } from '$lib/models/reactions';
  import { working } from '$lib/stores/working';

  export let organizationId: string;
  export let groupId: string;
  export let userId: string;
  export let userHandle: string;
  export let contextId: string | null;
  export let context: CommentContext;
  export let parent: string | null;
  export let depth: number;
  export let collectionPath: string;

  let anon: boolean;
  $: anon = false;

  let blocks: Block[];
  $: blocks = [
    {
      uid: crypto.randomUUID(),
      content: '',
      type: 'text'
    }
  ];

  async function saveBlocks(nextBlocks: Block[]) {
    blocks = nextBlocks.slice();
  }

  async function onPublish() {
    const job = working.add();
    const commentProps: CommentProps = {
      organization_id: organizationId,
      group_id: groupId,
      user_id: anon ? null : userId,
      user_handle: anon ? 'anonymous' : userHandle,
      context_id: contextId,
      context,
      parent,
      depth,
      blocks
    };
    const tallyProps: ReactionTallyProps = {
      ...createEmptyReactions(),
      ...createEmptyReinforcements(),
      seen: 0
    };
    const commentRef = doc(collection(db, collectionPath));
    const tallyRef = doc(db, collectionPath, commentRef.id, 'tallies', 'reactions');
    const batch = writeBatch(db);
    batch.set(commentRef, {
      ...commentProps,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    batch.set(tallyRef, {
      ...tallyProps,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    await batch.commit();
    blocks = [
      {
        uid: crypto.randomUUID(),
        content: '',
        type: 'text'
      }
    ];
    working.remove(job);
  }
</script>

<div class="card bg-base-200 w-full">
  <div class="card-body px-0 pt-5 pb-4" class:opacity-60={$working.length !== 0}>
    <div>
      <BlocksEditor
        placeholder="Empty comment block"
        {blocks}
        {saveBlocks}
        editable={$working.length === 0}
      />
    </div>
    <div class="card-actions items-center px-3">
      <div class="flex-1" />
      <label for="anonymous" class="flex flex-row items-center gap-2 cursor-pointer">
        <span class="text-sm" class:text-base-content={anon} class:text-neutral={!anon}>
          Submit as anonymous
        </span>
        <input
          type="checkbox"
          id="anonymous"
          name="anonymous"
          class="checkbox checkbox-primary"
          bind:checked={anon}
        />
      </label>
      <button class="btn btn-success btn-sm" on:click={onPublish}>Publish</button>
    </div>
  </div>
</div>
