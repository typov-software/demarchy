<script lang="ts">
  import autosize from '$lib/stores/use-autosize';
  import { enhance } from '$app/forms';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import CommentCard from '$lib/components/CommentCard.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import { db, user } from '$lib/firebase';
  import { working } from '$lib/stores/working';
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import {
    orderBy,
    collection,
    getDocs,
    query,
    startAfter,
    limit,
    QueryDocumentSnapshot,
    type DocumentData,
    onSnapshot
  } from 'firebase/firestore';
  import type { CommentProps } from '$lib/models/comments';
  import { inview } from 'svelte-inview';
  import { fly } from 'svelte/transition';
  import SvelteMarkdown from 'svelte-markdown';

  export let data: PageData;

  $: group = data.group!;
  $: groups = data.groups.slice();

  $: showForm = false;
  $: commentBody = '';
  $: commentAnon = false;
  $: viewRaw = true;

  $: userId = $user!.uid;

  $: comments = [] as QueryDocumentSnapshot<DocumentData, CommentProps>[];
  $: realtimeComments = [] as QueryDocumentSnapshot<DocumentData, CommentProps>[];
  $: hasMore = true;
  $: loadingMore = false;

  async function getPage() {
    if (!hasMore || loadingMore) {
      return;
    }
    loadingMore = true;
    const after = comments.slice().pop();
    let snapshot;
    if (after) {
      const q = query(
        collection(db, 'organizations', data.organization.id, 'groups', data.group!.id, 'feedback'),
        orderBy('created_at', 'desc'),
        startAfter(after),
        limit(10)
      );
      snapshot = await getDocs(q);
    } else {
      const q = query(
        collection(db, 'organizations', data.organization.id, 'groups', data.group!.id, 'feedback'),
        orderBy('created_at', 'desc'),
        limit(10)
      );
      snapshot = await getDocs(q);
    }
    const moreComments = snapshot.docs.slice() as QueryDocumentSnapshot<
      DocumentData,
      CommentProps
    >[];
    hasMore = snapshot.size >= 10;
    comments = [...comments, ...moreComments];
    loadingMore = false;
  }

  let unsubscribe: () => void;
  onMount(() => {
    getPage().then(async () => {
      const after = comments.slice().shift();
      if (after) {
        const q = query(
          collection(
            db,
            'organizations',
            data.organization.id,
            'groups',
            data.group!.id,
            'feedback'
          ),
          orderBy('created_at', 'asc'),
          startAfter(after)
        );

        unsubscribe = await onSnapshot(q, (snapshot) => {
          const newComments = snapshot
            .docChanges()
            .filter((c) => c.type === 'added')
            .map((c) => c.doc)
            .slice() as QueryDocumentSnapshot<DocumentData, CommentProps>[];
          if (newComments.length) {
            realtimeComments = [...realtimeComments, ...newComments];
          }
        });
      }
    });
    return () => unsubscribe();
  });
</script>

<BasicSection otherClass="py-0 pb-8">
  <div class="flex flex-row w-full items-center">
    <Breadcrumbs {group} {groups} />
    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-square btn-sm btn-primary rounded-xl">
        <span class="material-symbols-outlined">more_vert</span>
      </div>
      <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
        <ul class="menu w-60">
          <li>
            <button
              on:click={(e) => {
                showForm = true;
                e.currentTarget.blur();
              }}
            >
              <span class="material-symbols-outlined">add_comment</span>
              Add feedback
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>

  {#if showForm}
    <form
      class="max-w-xl w-full flex flex-col gap-4"
      method="post"
      action="?/createFeedback"
      use:enhance={() => {
        const jobId = working.add();
        return async ({ update }) => {
          commentBody = '';
          commentAnon = false;
          working.remove(jobId);
          update({ reset: true });
        };
      }}
    >
      <input type="hidden" name="organization_id" value={data.organization?.id} />
      <input type="hidden" name="group_id" value={data.group?.id} />
      <input type="hidden" name="user_handle" value={data.profile.handle} />

      {#if viewRaw}
        <!-- this autofocus doesn't occur on page load -->
        <!-- svelte-ignore a11y-autofocus -->
        <textarea
          use:autosize
          class="textarea bg-base-200 rounded-md"
          class:textarea-success={commentBody.trim().length > 0}
          name="body"
          id="body"
          placeholder="Submit your feedback to the group"
          rows={3}
          autofocus={true}
          autocomplete="off"
          bind:value={commentBody}
        ></textarea>
      {:else}
        <div class="comment-body bg-base-200 p-4">
          <SvelteMarkdown source={commentBody} />
        </div>
      {/if}
      <div class="flex flex-row items-center gap-4">
        <div class="flex flex-1 gap-2">
          <button
            class="btn btn-xs text-xs"
            class:btn-error={viewRaw}
            on:click={(e) => {
              e.preventDefault();
              viewRaw = true;
            }}>Raw</button
          >
          <button
            class="btn btn-xs text-xs"
            class:btn-success={!viewRaw}
            on:click={(e) => {
              e.preventDefault();
              viewRaw = false;
            }}>Formatted</button
          >
        </div>
        <label for="anonymous" class="flex flex-row items-center gap-2 cursor-pointer">
          <span
            class="text-sm"
            class:text-base-content={commentAnon}
            class:text-neutral={!commentAnon}>Submit as anonymous</span
          >
          <input
            type="checkbox"
            id="anonymous"
            name="anonymous"
            class="checkbox checkbox-primary"
            bind:checked={commentAnon}
          />
        </label>
        <button
          type="submit"
          class="btn btn-success btn-sm rounded-xl self-end"
          disabled={commentBody.trim().length === 0}>Create</button
        >
      </div>
    </form>
  {/if}

  {#if realtimeComments.length}
    <ul class="w-full flex flex-col-reverse gap-4 items-center">
      {#each realtimeComments as comment}
        <li class="w-full max-w-xl" in:fly={{ x: -50 }}>
          <CommentCard document={comment} {userId} context="feedback" contextId={comment.id} />
        </li>
      {/each}
    </ul>
    <div class="divider divider-primary text-secondary text-sm p-0 m-0">
      <span class="text-base-content"> New comments </span>
    </div>
  {/if}

  <ul class="w-full flex flex-col gap-4 items-center">
    {#each comments as comment}
      <li class="w-full max-w-xl" in:fly={{ x: -50 }}>
        <CommentCard document={comment} {userId} context="feedback" contextId={comment.id} />
      </li>
    {/each}
  </ul>

  <div use:inview={{}} on:inview_enter={() => getPage()} />
</BasicSection>

<div class="flex-1" />
<PageView />
