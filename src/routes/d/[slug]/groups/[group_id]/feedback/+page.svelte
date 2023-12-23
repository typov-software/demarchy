<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import CommentCard from '$lib/components/CommentCard.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import { user } from '$lib/firebase';
  import { working } from '$lib/stores/working';
  import type { PageData } from './$types';

  export let data: PageData;

  $: group = data.group!;
  let groups = data.groups.slice();
  let commentBody = '';

  $: isModalRoute = $page.url.searchParams.get('modal') === 'feedback';
  let userId = $user!.uid;

  async function onCloseModal() {
    await goto($page.url.pathname);
  }
</script>

<BasicSection otherClass="py-0">
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
            <a href="{$page.url.pathname}?modal=feedback" title="Add feedback">
              <span class="material-symbols-outlined">add_comment</span>
              Add feedback
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <ul class="w-full flex flex-col gap-4 items-center">
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
        <input type="hidden" name="user_handle" value={data.profile.handle} />

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

<div class="flex-1" />
<PageView />
