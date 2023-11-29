<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
  import { db, user } from '$lib/firebase';
  import { page } from '$app/stores';
  import type { Invitation, InvitationProps } from '$lib/models/invitations';
  import { getRoleName } from '$lib/models/roles';
  import { goto } from '$app/navigation';
  import type { Profile, ProfileProps } from '$lib/models/profiles';
  import { enhance } from '$app/forms';

  export let data: PageData;

  let invitations: Invitation[] = [];

  onMount(async () => {
    const ref = query(
      collection(db, 'organizations', data.organization!.id, 'invitations'),
      where('workspace_id', '==', $page.params.workspace_id)
    );
    onSnapshot(ref, (snapshot) => {
      invitations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as InvitationProps)
      }));
    });
  });

  async function onCloseModal() {
    await goto($page.url.pathname);
  }

  let handle: string = '';
  let handleUserId: string | null = null;
  let loadingHandle = false;
  let isHandle = false;
  let debounceTimer: NodeJS.Timeout;
  $: isHandleTouched = handle.length > 0;
  let handleProfile: Profile | null = null;

  async function checkValidHandle() {
    clearTimeout(debounceTimer);
    loadingHandle = true;
    isHandle = false;
    debounceTimer = setTimeout(async () => {
      if (handle.trim().length) {
        const ref = doc(db, 'handles', handle);
        const handleDoc = await getDoc(ref);
        isHandle = handleDoc.exists();
        handleUserId = isHandle ? handleDoc.data()!.uid : null;
        if (isHandle && handleUserId) {
          const profileDoc = await getDoc(doc(db, 'profiles', handleUserId));
          handleProfile = {
            id: profileDoc.id,
            ...(profileDoc.data() as ProfileProps)
          };
        } else {
          handleProfile = null;
        }
      } else {
        isHandle = false;
      }
      loadingHandle = false;
    }, 500);
  }
</script>

<section class="flex flex-col items-center py-6 px-4 gap-8">
  <div class="flex flex-row w-full items-center">
    <h2 class="flex text-lg">Invitations for {data.workspace?.name}</h2>
    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost">Actions</div>
      <div class="dropdown-content z-[1] shadow bg-base-300">
        <ul class="menu p-0 w-60">
          <li><a href="{$page.url.pathname}?modal=invite">Invite someone</a></li>
        </ul>
      </div>
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Handle</th>
        <th>Role</th>
      </tr>
    </thead>
    <tbody>
      {#each invitations as invitation}
        <tr>
          <td>@{invitation.handle}</td>
          <td>{getRoleName(invitation.role)}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <dialog
    id="invite"
    class="modal"
    class:modal-open={$page.url.searchParams.get('modal') === 'invite'}
  >
    <div class="modal-box">
      <h3 class="text-lg mb-4">Invite someone to this workspace</h3>
      <form method="POST" action="?/invite" use:enhance>
        <input type="hidden" name="organization_id" value={data.organization?.id} />
        <input type="hidden" name="workspace_id" value={data.workspace?.id} />
        <input type="hidden" name="user_id" bind:value={handleUserId} />
        <input type="hidden" name="role" value="mem" />
        <input type="hidden" name="created_by" value={$user?.uid} />

        <div class="flex gap-4">
          <input
            type="text"
            id="handle"
            name="handle"
            autocomplete="off"
            placeholder="User handle"
            class="input input-bordered w-full"
            bind:value={handle}
            on:input={checkValidHandle}
          />
          <button
            disabled={loadingHandle || !isHandle || !handleProfile}
            type="submit"
            class="btn btn-primary">Add</button
          >
        </div>
        {#if loadingHandle}
          <p class="text-sm pt-4">Checking if this @{handle} exists...</p>
        {/if}
        {#if !loadingHandle && isHandleTouched && !isHandle}
          <p class="text-error text-sm pt-4">This person does not exist</p>
        {/if}
        {#if !loadingHandle && isHandle && handleProfile}
          <div class="flex items-center gap-4 mt-4">
            <img src={handleProfile.photo_url} class="avatar w-16" alt={handleProfile.name} />
            <p>{handleProfile.name} (@{handleProfile.handle})</p>
          </div>
        {/if}
      </form>
    </div>
    <form method="dialog" class="modal-backdrop" on:submit={onCloseModal}>
      <button>close</button>
    </form>
  </dialog>
</section>
