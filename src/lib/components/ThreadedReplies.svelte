<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { Comment, CommentContext } from '$lib/models/comments';
  import { tick } from 'svelte';
  import Replies from './Replies.svelte';

  export let can_write: boolean;
  export let organizationId: string;
  export let groupId: string;
  export let contextId: string;
  export let context: CommentContext;
  export let pinnable = false;

  let scrollingEl: HTMLDivElement;
  $: thread = $page.url.searchParams.get('thread');
  $: highlighted = thread?.split('_') ?? [];

  let parents: string[] = [];
  $: parents =
    thread?.split('_').reduce((acc, val, i) => {
      if (acc.length) {
        acc.push(`${acc[i - 1]}_${val}`);
      } else {
        acc.push(val);
      }
      return acc;
    }, [] as string[]) ?? [];

  async function handleReply(e: CustomEvent<{ comment: Comment }>) {
    const { comment } = e.detail;
    const { id } = comment;
    let parent: string;

    if (comment.depth >= parents.length) {
      parent = parents.length ? `${parents.at(-1)}_${id}` : id;
      if (parents.length) {
        parents = [...parents, parent];
      } else {
        parents = [parent];
      }
    } else {
      const next = parents.slice();
      next.splice(comment.depth, parents.length - comment.depth);
      parent = next.length ? `${next.at(-1)}_${id}` : id;
      parents = [...next, parent];
    }
    $page.url.searchParams.set('thread', parent);
    goto(`?${$page.url.searchParams.toString()}`, {
      // disabled scrolling the window to top
      noScroll: true
    });
    await tick();
    scrollingEl.scrollTo({ left: scrollingEl.scrollWidth, behavior: 'smooth' });
    // smooth scrolling with after using `goto` doesn't work as expected
    window.scrollTo({ top: scrollingEl.offsetTop });
  }
</script>

<div
  bind:this={scrollingEl}
  class="pt-4 gap-4 flex h-full"
  style:min-height="50vh"
  class:overflow-x-auto={parents.length}
>
  <Replies
    {can_write}
    threaded={true}
    {organizationId}
    {groupId}
    {context}
    {contextId}
    parent={null}
    depth={0}
    {highlighted}
    {pinnable}
    on:reply={handleReply}
    on:pin:clarification
    on:pin:concern
  />

  {#each parents as parent, index (parent)}
    <Replies
      {can_write}
      threaded={true}
      {organizationId}
      {groupId}
      {context}
      {contextId}
      {parent}
      depth={index + 1}
      {highlighted}
      {pinnable}
      on:reply={handleReply}
      on:pin:clarification
      on:pin:concern
    />
  {/each}
</div>
