<script lang="ts">
  import { page } from '$app/stores';
  import { type OrderByDirection, doc, getDoc } from 'firebase/firestore';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import { enhance } from '$app/forms';
  import { workingCallback } from '$lib/stores/working';
  import { user, db } from '$lib/firebase';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import ProfileLink from '$lib/components/ProfileLink.svelte';
  import { formatRelative } from 'date-fns';
  import { makeDocument } from '$lib/models/utils';
  import type { Profile } from '$lib/models/profiles';

  export let data: PageData;

  $: group = data.group!;
  $: context = group.id === data.organization.id ? 'organization' : 'group';

  let numMembers = data.members.length ?? 0;
  let isOnlyMember = numMembers === 1 && data.members.at(0)?.id === $user?.uid;

  function onSort(field: string, direction: OrderByDirection) {
    return async () => {
      await setSort(field, direction);
    };
  }

  async function setSort(field: string, direction: OrderByDirection) {
    const searchParams = $page.url.searchParams;
    searchParams.set('sortBy', field);
    searchParams.set('direction', direction);
    await goto(`${$page.url.pathname}?${searchParams.toString()}`, { invalidateAll: true });
  }

  let invitedProfileHandle: string = '';
  let invitedUserId: string | null = null;
  let loadingInvitedProfile = false;
  let invitedUserExists = false;
  let debounceTimer: NodeJS.Timeout;
  $: isInvitingTouched = invitedProfileHandle.length > 0;
  let invitedProfile: Profile | null = null;

  async function onCloseModal() {
    await goto($page.url.pathname);
  }

  async function checkValidHandle() {
    clearTimeout(debounceTimer);
    loadingInvitedProfile = true;
    invitedUserExists = false;
    debounceTimer = setTimeout(async () => {
      if (invitedProfileHandle.trim().length) {
        const ref = doc(db, 'handles', invitedProfileHandle);
        const handleDoc = await getDoc(ref);
        invitedUserExists = handleDoc.exists();
        invitedUserId = invitedUserExists ? handleDoc.data()!.user_id : null;
        if (invitedUserExists && invitedUserId) {
          const profileDoc = await getDoc(doc(db, 'profiles', invitedUserId));
          invitedProfile = makeDocument<Profile>(profileDoc);
        } else {
          invitedProfile = null;
        }
      } else {
        invitedUserExists = false;
      }
      loadingInvitedProfile = false;
    }, 500);
  }
</script>

<BasicSection otherClass="py-0">
  <div class="flex flex-row w-full items-center">
    <Breadcrumbs organization={data.organization} groups={data.groups} group={data.group} />
  </div>

  {#if data.invitations.length}
    <div class="w-full max-w-3xl">
      <div class="card bg-base-200">
        <div class="card-body px-0 py-4">
          <div class="card-title w-full pl-4 pr-2">
            <span class="flex-1">Invitations</span>

            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-sm btn-square btn-neutral">
                <span class="material-symbols-outlined">more_vert</span>
              </div>
              <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
                <ul class="menu w-60">
                  <li>
                    <a href="?modal=invite" title="Invite someone">
                      <span class="material-symbols-outlined">person_add</span>
                      Invite someone
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <ul>
            {#each data.invitations as invitation (invitation.id)}
              <li class="flex items-center hover:bg-base-300 pl-4 pr-2 py-1">
                <ProfileLink handle={invitation.invited_profile_handle} />
                <div class="flex-1" />
                <small class="px-2 text-neutral text-xs">
                  {formatRelative(invitation.created_at, new Date())}
                </small>
                {#if invitation.rejected}
                  <div class="badge badge-error text-xs mx-2">rejected</div>
                {/if}
                <div class="dropdown dropdown-end">
                  <button tabindex="0" class="btn btn-sm btn-square btn-ghost">
                    <span class="material-symbols-outlined">more_vert</span>
                  </button>
                  <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
                    <ul class="menu w-64">
                      {#if data.role === 'mod' || invitation.user_id === $user?.uid}
                        <li>
                          <form
                            id={`uninvite-${invitation.invited_user_id}`}
                            method="POST"
                            action="?/uninvite"
                            use:enhance={workingCallback({ invalidateAll: true })}
                            class="hidden"
                          >
                            <input
                              type="hidden"
                              name="organization_id"
                              value={invitation.organization_id}
                            />
                            <input type="hidden" name="invitation_id" value={invitation.id} />
                          </form>
                          <button
                            form={`uninvite-${invitation.invited_user_id}`}
                            type="submit"
                            disabled={invitation.user_id !== $user?.uid}
                            class="w-full"
                          >
                            {invitation.rejected ? 'Remove' : 'Uninvite'}
                          </button>
                        </li>
                      {/if}
                    </ul>
                    <small class="px-4 pb-3 pt-1 block text-xs text-right">
                      Invited by
                      <ProfileLink handle={invitation.profile_handle} />
                    </small>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
  {/if}

  <div class="w-full max-w-3xl">
    <div class="card bg-base-200">
      <div class="card-body px-0 py-4">
        <div class="card-title w-full pl-4 pr-2">
          <span class="flex-1">Members</span>
          <div class="dropdown dropdown-end mr-1">
            <div tabindex="0" role="button" class="btn btn-square btn-sm btn-ghost">
              <span class="material-symbols-outlined">sort</span>
            </div>
            <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
              <ul class="menu w-40">
                <li><button on:click={onSort('handle', 'asc')}>Handle ASC</button></li>
                <li><button on:click={onSort('handle', 'desc')}>Handle DESC</button></li>
              </ul>
            </div>
          </div>

          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-sm btn-square btn-neutral">
              <span class="material-symbols-outlined">more_vert</span>
            </div>
            <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
              <ul class="menu w-60">
                <li>
                  <form
                    class="flex justify-start text-left"
                    method="post"
                    action="?/leaveGroup"
                    use:enhance={workingCallback()}
                  >
                    <input type="hidden" name="context" value={context} />
                    <input type="hidden" name="organization_id" value={data.organization.id} />
                    <input type="hidden" name="group_id" value={data.group?.id} />
                    <span
                      class="material-symbols-outlined text-error"
                      class:text-neutral={isOnlyMember}>logout</span
                    >
                    <button
                      disabled={isOnlyMember}
                      class:cursor-not-allowed={isOnlyMember}
                      class:text-neutral={isOnlyMember}
                      class="text-error w-full text-left"
                      title={`Leave ${context}`}
                    >
                      Leave {context}</button
                    >
                  </form>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <ul>
          {#each data.members as member (member.id)}
            <li class="flex items-center hover:bg-base-300 pl-4 pr-2 py-3">
              <ProfileLink handle={member.handle} />
              <div class="flex-1" />
              <small class="px-2 text-neutral text-xs">
                Since {formatRelative(member.created_at, new Date())}
              </small>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</BasicSection>

<dialog
  id="invite"
  class="modal"
  class:modal-open={$page.url.searchParams.get('modal') === 'invite'}
>
  <div class="modal-box">
    <h3 class="text-lg mb-4">Invite someone to this group</h3>
    <form method="POST" action="?/invite" use:enhance={workingCallback()}>
      <input type="hidden" name="organization_id" value={data.organization.id} />
      <input type="hidden" name="organization_name" value={data.organization.name} />
      <input type="hidden" name="group_id" value={data.group.id} />
      <input type="hidden" name="group_name" value={data.group.name} />
      <input type="hidden" name="invited_user_id" bind:value={invitedUserId} />
      <input type="hidden" name="role" value="mem" />
      <input type="hidden" name="user_id" value={$user?.uid} />
      <input type="hidden" name="profile_handle" value={data.profile.handle} />

      <div class="flex gap-4">
        <input
          type="text"
          id="handle"
          name="invited_profile_handle"
          autocomplete="off"
          placeholder="User handle"
          class="input input-bordered w-full"
          bind:value={invitedProfileHandle}
          on:input={checkValidHandle}
        />
        <button
          disabled={loadingInvitedProfile || !invitedUserExists || !invitedProfile}
          type="submit"
          class="btn btn-primary">Add</button
        >
      </div>
      {#if loadingInvitedProfile}
        <p class="text-sm pt-4">Checking if this @{invitedProfileHandle} exists...</p>
      {/if}
      {#if !loadingInvitedProfile && isInvitingTouched && !invitedUserExists}
        <p class="text-error text-sm pt-4">This person does not exist</p>
      {/if}
      {#if !loadingInvitedProfile && invitedUserExists && invitedProfile}
        <div class="flex items-center gap-4 mt-4">
          <img src={invitedProfile.photo_url} class="avatar w-16" alt={invitedProfile.name} />
          <p>{invitedProfile.name} (@{invitedProfile.handle})</p>
        </div>
      {/if}
    </form>
  </div>
  <form method="dialog" class="modal-backdrop" on:submit={onCloseModal}>
    <button>close</button>
  </form>
</dialog>
