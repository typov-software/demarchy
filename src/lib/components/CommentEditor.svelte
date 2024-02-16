<script lang="ts">
  import type { Block } from '$lib/models/blocks';
  import {
    doc,
    collection,
    serverTimestamp,
    writeBatch,
    increment,
    getDoc
  } from 'firebase/firestore';
  import BlocksEditor from './BlocksEditor.svelte';
  import { db } from '$lib/firebase';
  import type { Comment, CommentContext, CommentProps } from '$lib/models/comments';
  import {
    createEmptyReactions,
    createEmptyReinforcements,
    type ReactionTallyProps
  } from '$lib/models/reactions';
  import { working } from '$lib/stores/working';
  import { makeDocument } from '$lib/models/utils';
  import { onMount } from 'svelte';
  import ProfileLink from './ProfileLink.svelte';
  import { emptyString } from '$lib/utils/string';

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

  let blocks: Block[] = [
    {
      uid: crypto.randomUUID(),
      content: '',
      type: 'text'
    }
  ];
  $: blocks;

  $: allContent = blocks
    .map((b) => b.content)
    .join('')
    .trim();
  $: canSave = !emptyString(allContent);

  let parentComment: null | Comment = null;
  $: parentComment;

  onMount(() => {
    if (parent) {
      getParentComment();
    }
  });

  async function getParentComment() {
    const parentId = parent?.split('_').pop();
    if (parentId) {
      const parentRef = doc(db, collectionPath, parentId);
      const parentDoc = await getDoc(parentRef);
      if (parentDoc.exists()) {
        parentComment = makeDocument<Comment>(parentDoc);
      } else {
        parentComment = null;
      }
    }
  }

  async function saveBlocks(nextBlocks: Block[]) {
    blocks = nextBlocks.slice();
  }

  async function onPublish() {
    const job = working.add();
    const commentProps: CommentProps = {
      organization_id: organizationId,
      group_id: groupId,
      user_id: anon ? null : userId,
      profile_handle: anon ? 'anonymous' : userHandle,
      context_id: contextId,
      context,
      parent,
      depth,
      blocks
    };
    const tallyProps: ReactionTallyProps = {
      ...createEmptyReactions(),
      ...createEmptyReinforcements(),
      seen: 0,
      replies: 0
    };

    // new doc ref at location
    const commentRef = doc(collection(db, collectionPath));
    // new tally ref on fresh comment
    const tallyRef = doc(db, collectionPath, commentRef.id, 'tallies', 'reactions');
    const contextPath = `/organizations/${organizationId}/groups/${groupId}/${context}/${contextId}`;
    const contextTallyRef = doc(db, contextPath, 'tallies', 'reactions');

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

    if (context !== 'feedback') {
      batch.update(contextTallyRef, {
        replies: increment(1),
        updated_at: serverTimestamp()
      });
    }

    if (parent) {
      // Get the last id segment
      const parentId = parent.split('_').pop()!;
      const parentTalliesRef = doc(db, collectionPath, parentId, 'tallies', 'reactions');
      batch.update(parentTalliesRef, {
        replies: increment(1),
        updated_at: serverTimestamp()
      });
    }

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
  <div
    class="card-body px-0 pt-5 pb-4"
    class:pt-2={parentComment}
    class:opacity-60={$working.length !== 0}
  >
    {#if parentComment}
      <div class="rounded-t-box">
        <small class="text-neutral px-3 italic"
          >Replying to
          {#if !parentComment.user_id}
            anonymous
          {:else if parentComment.profile_handle}
            <ProfileLink handle={parentComment.profile_handle} />
          {/if}
        </small>
        <div class="bg-base-300 border-l-2 mt-2">
          <BlocksEditor blocks={parentComment.blocks} editable={false} />
        </div>
      </div>
    {/if}
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
      <label for={`anonymous-${depth}`} class="flex flex-row items-center gap-2 cursor-pointer">
        <span class="text-sm" class:text-base-content={anon} class:text-neutral={!anon}>
          Submit as anonymous
        </span>
        <input
          type="checkbox"
          id={`anonymous-${depth}`}
          name="anonymous"
          class="checkbox checkbox-primary"
          bind:checked={anon}
        />
      </label>
      <button disabled={!canSave} class="btn btn-success btn-sm" on:click={onPublish}
        >Publish</button
      >
    </div>
  </div>
</div>
