<script lang="ts">
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import type { DiscussionProps } from '$lib/models/discussions';
  import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
  import type { PageData } from './$types';
  import { db } from '$lib/firebase';
  import { goto } from '$app/navigation';
  import { working } from '$lib/stores/working';
  import { formatRelative } from 'date-fns';
  import {
    createEmptyReactions,
    createEmptyReinforcements,
    type ReactionTallyProps
  } from '$lib/models/reactions';

  export let data: PageData;

  async function draftDiscussion() {
    const job = working.add();
    const draftProps: DiscussionProps = {
      organization_id: data.organization.id,
      group_id: data.group.id,

      user_id: data.profile.id,
      profile_handle: data.profile.handle,

      blocks: [{ uid: crypto.randomUUID(), content: 'New discussion', type: 'text' }],
      state: 'draft'
    };
    const tallyProps: ReactionTallyProps = {
      ...createEmptyReactions(),
      ...createEmptyReinforcements(),
      seen: 0,
      replies: 0
    };
    const draftRef = doc(
      collection(db, `/organizations/${data.organization.id}/groups/${data.group.id}/discussions`)
    );
    const tallyRef = doc(
      db,
      `/organizations/${data.organization.id}/groups/${data.group.id}/discussions/${draftRef.id}/tallies/reactions`
    );
    const batch = writeBatch(db);
    batch.set(draftRef, {
      ...draftProps,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    batch.set(tallyRef, {
      ...tallyProps,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    await batch.commit();
    working.remove(job);
    goto(`/d/${$page.params.slug}/${$page.params.group_id}/discussions/${draftRef.id}`);
  }
</script>

<BasicSection otherClass="!items-start">
  <div class="flex flex-row w-full items-center">
    <Breadcrumbs organization={data.organization} groups={data.groups} group={data.group} />
    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-sm btn-square btn-primary">
        <span class="material-symbols-outlined">more_vert</span>
      </div>
      <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
        <ul class="menu w-60">
          <li>
            <button on:click={() => draftDiscussion()} disabled={$working.length > 0}>
              <span class="material-symbols-outlined">add</span>
              Draft a discussion
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>

  {#if data.drafts.length}
    <div class="flex flex-col w-full">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Your Drafts</th>
            <th class="text-right">Last updated</th>
          </tr>
        </thead>
        <tbody>
          {#each data.drafts as discussion (discussion.id)}
            <tr>
              <td class="w-full max-w-[0]">
                <a
                  href={$page.url.pathname + '/' + discussion.id}
                  class="link link-hover block truncate italic"
                >
                  {discussion.blocks[0].content}
                </a>
              </td>
              <td class="text-right text-neutral text-nowrap">
                {formatRelative(discussion.updated_at, new Date())}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  {#if data.open.length}
    <div class="flex flex-col w-full">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Open Discussions</th>
            <th class="text-right">Last updated</th>
          </tr>
        </thead>
        <tbody>
          {#each data.open as discussion (discussion.id)}
            <tr>
              <td class="w-full max-w-[0]">
                <a
                  href={$page.url.pathname + '/' + discussion.id}
                  class="link link-hover block truncate italic"
                >
                  {discussion.blocks[0].content}
                </a>
              </td>
              <td class="text-right text-neutral text-nowrap">
                {formatRelative(discussion.updated_at, new Date())}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</BasicSection>
