<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import CommentCard from '$lib/components/CommentCard.svelte';
  import { user } from '$lib/firebase';
  import { working } from '$lib/stores/working';
  import type { PageData } from './$types';

  export let data: PageData;

  let groupsPath = `/d/${$page.params.slug}/groups`;
  let groupPath = `${groupsPath}/${data.group!.id}`;
  let feedbackPath = `${groupPath}/feedback`;

  let commentBody = '';

  $: isModalRoute = $page.url.searchParams.get('modal') === 'feedback';
  let userId = $user!.uid;

  async function onCloseModal() {
    await goto($page.url.pathname);
  }
</script>

<div class="text-sm breadcrumbs self-start py-4 px-4">
  <ul>
    <li><a href={groupsPath}>Groups</a></li>
    <li><a href={groupPath}>{data.group?.name}</a></li>
    <li><a href={feedbackPath}>Feedback</a></li>
  </ul>
</div>

<BasicSection otherClass="py-0">
  <div class="flex flex-row w-full items-center">
    <h2 class="flex text-lg">Feedback for {data.group?.name}</h2>
    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost">Actions</div>
      <div class="dropdown-content z-[1] shadow bg-base-300">
        <ul class="menu p-0 w-60">
          <li><a href="{$page.url.pathname}?modal=feedback">Add Feedback</a></li>
        </ul>
      </div>
    </div>
  </div>

  <ul>
    {#each data.comments as comment}
      <li>
        <CommentCard {comment} {userId} context="feedback" contextId={comment.id} />
      </li>
    {/each}
  </ul>

  <dialog id="feedback" class="modal" class:modal-open={isModalRoute}>
    <div class="modal-box">
      <h3 class="text-lg mb-4">Submit Feedback to {data.group?.name}</h3>
      <form
        method="post"
        action="?/createFeedback"
        use:enhance={() => {
          const jobId = working.add();
          return async ({ update }) => {
            working.remove(jobId);
            update({ reset: true });
          };
        }}
      >
        <input type="hidden" name="organization_id" value={data.organization?.id} />
        <input type="hidden" name="group_id" value={data.group?.id} />

        <div class="flex flex-col gap-4">
          <textarea name="body" id="body" bind:value={commentBody}></textarea>
          <button>Create</button>
        </div>
      </form>
    </div>

    <form method="dialog" class="modal-backdrop" on:submit={onCloseModal}>
      <button>close</button>
    </form>
  </dialog>
</BasicSection>
