<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
  import { db, user } from '$lib/firebase';
  import { page } from '$app/stores';
  import type { Invitation } from '$lib/models/invitations';
  import { getRoleName } from '$lib/models/roles';
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
  import type { Profile } from '$lib/models/profiles';
  import { enhance } from '$app/forms';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import { INVITATIONS, ORGANIZATIONS } from '$lib/models/firestore';
  import { working } from '$lib/stores/working';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { makeDocument } from '$lib/models/utils';

  export let data: PageData;

  $: userId = $user?.uid;
  $: invitations = [] as Invitation[];

  let unsubscribe: undefined | (() => void);
  $: unsubscribe = undefined;
  $: settingUp = false;

  async function setup() {
    if (settingUp) return;
    settingUp = true;
    const ref = query(
      collection(db, ORGANIZATIONS, data.organization!.id, INVITATIONS),
      where('group_id', '==', $page.params.group_id)
    );
    unsubscribe = onSnapshot(ref, (snapshot) => {
      invitations = snapshot.docs.map(makeDocument<Invitation>);
    });
    settingUp = false;
  }

  function teardown() {
    if (unsubscribe) {
      unsubscribe();
    }
    unsubscribe = undefined;
  }

  onMount(() => {
    setup();
    return () => teardown();
  });

  beforeNavigate(({ from, to }) => {
    if (from?.url.pathname !== to?.url.pathname) {
      teardown();
    }
  });

  afterNavigate(() => {
    if (!unsubscribe) {
      setup();
    }
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
        handleUserId = isHandle ? handleDoc.data()!.user_id : null;
        if (isHandle && handleUserId) {
          const profileDoc = await getDoc(doc(db, 'profiles', handleUserId));
          handleProfile = makeDocument<Profile>(profileDoc);
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

<BasicSection otherClass="py-0">
  <div class="flex flex-row w-full items-center">
    <Breadcrumbs organization={data.organization} groups={data.groups} group={data.group} />
    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-square btn-sm btn-primary">
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
      {#each invitations as invitation (invitation.id)}
        <tr>
          <td>@{invitation.invited_profile_handle}</td>
          <td>{getRoleName(invitation.role)}</td>
          <td>{invitation.rejected ? 'Rejected' : 'Pending'}</td>
          <td>
            <div class="dropdown dropdown-end">
              <button tabindex="0" class="btn btn-sm btn-square btn-ghost">
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
                      <button type="submit" disabled={invitation.user_id !== userId}>
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
        <input type="hidden" name="organization_name" value={data.organization?.name} />
        <input type="hidden" name="group_id" value={data.group?.id} />
        <input type="hidden" name="group_name" value={data.group?.name} />
        <input type="hidden" name="invited_user_id" bind:value={handleUserId} />
        <input type="hidden" name="role" value="mem" />
        <input type="hidden" name="user_id" value={$user?.uid} />

        <div class="flex gap-4">
          <input
            type="text"
            id="handle"
            name="invited_profile_handle"
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
