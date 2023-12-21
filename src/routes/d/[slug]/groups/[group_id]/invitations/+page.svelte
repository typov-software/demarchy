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
  import BasicSection from '$lib/components/BasicSection.svelte';
  import { INVITATIONS, ORGANIZATIONS } from '$lib/models/firestore';
  import { working } from '$lib/stores/working';
  import GroupBreadcrumbs from '../GroupBreadcrumbs.svelte';
  import PageView from '$lib/components/PageView.svelte';

  export let data: PageData;
  let group = data.group!;
  let groups = data.groups.slice();
  $: uid = $user?.uid;

  let invitations: Invitation[] = [];

  onMount(() => {
    const ref = query(
      collection(db, ORGANIZATIONS, data.organization!.id, INVITATIONS),
      where('group_id', '==', $page.params.group_id)
    );
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      invitations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as InvitationProps)
      }));
    });
    return () => unsubscribe();
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

<GroupBreadcrumbs {group} {groups} />

<BasicSection otherClass="py-0">
  <div class="flex flex-row w-full items-center">
    <h2 class="flex text-lg">Invitations for {data.group?.name}</h2>
    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-square btn-sm btn-primary rounded-xl">
        <span class="material-symbols-outlined">more_vert</span>
      </div>
      <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
        <ul class="menu w-60">
          <li>
            <a href="{$page.url.pathname}?modal=invite" title="Invite someone">
              <span class="material-symbols-outlined">person_add</span>
              Invite someone
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th class="w-full">Handle</th>
        <th>Role</th>
        <th>Status</th>
        <th />
      </tr>
    </thead>
    <tbody>
      {#each invitations as invitation}
        <tr>
          <td>@{invitation.handle}</td>
          <td>{getRoleName(invitation.role)}</td>
          <td>{invitation.rejected ? 'Rejected' : 'Pending'}</td>
          <td>
            <div class="dropdown dropdown-end">
              <button tabindex="0" class="btn btn-sm btn-square btn-ghost rounded-xl">
                <span class="material-symbols-outlined">more_vert</span>
              </button>
              <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
                <ul class="menu w-60">
                  <li>
                    <form
                      method="POST"
                      action="?/uninvite"
                      use:enhance={() => {
                        const jobId = working.add();
                        return async ({ update }) => {
                          working.remove(jobId);
                          update();
                        };
                      }}
                    >
                      <input
                        type="hidden"
                        name="organization_id"
                        value={invitation.organization_id}
                      />
                      <input type="hidden" name="invitation_id" value={invitation.id} />
                      <button type="submit" disabled={invitation.created_by !== uid}>
                        {invitation.rejected ? 'Remove' : 'Uninvite'}
                      </button>
                    </form>
                  </li>
                </ul>
              </div>
            </div>
          </td>
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
      <h3 class="text-lg mb-4">Invite someone to this group</h3>
      <form
        method="POST"
        action="?/invite"
        use:enhance={() => {
          const jobId = working.add();
          return async ({ update }) => {
            working.remove(jobId);
            update();
          };
        }}
      >
        <input type="hidden" name="organization_id" value={data.organization?.id} />
        <input type="hidden" name="group_id" value={data.group?.id} />
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
</BasicSection>

<div class="flex-1" />
<PageView />
