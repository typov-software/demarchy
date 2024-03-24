<script lang="ts">
  import { enhance } from "$app/forms";
  import { beforeNavigate, goto } from "$app/navigation";
  import { page } from "$app/stores";
  import ProfileLink from "$lib/components/ProfileLink.svelte";
  import { db, profile, user } from "$lib/firebase";
  import type { Group } from "$lib/models/groups";
  import type { Member } from "$lib/models/members";
  import type { Organization } from "$lib/models/organizations";
  import type { Profile } from "$lib/models/profiles";
  import { makeDocument } from "$lib/models/utils";
  import { workingCallback } from "$lib/stores/working";
  import { emptyString } from "$lib/utils/string";
  import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";

  export let open: boolean;
  export let organization: Organization;
  export let group: Group;

  let modalEl: HTMLDialogElement;
  $: isOrgGroup = organization.id === group.id;

  let profiles: Profile[] = [];
  $: profiles;

  let orgMembers: Member[] = [];
  $: orgMembers;

  let groupMembers: Member[] = [];
  $: groupMembers;

  let results: { profile: Profile; orgMember: Member | null; groupMember: Member | null }[] = [];
  $: results;

  let invitees: Profile[] = [];
  $: invitees;

  let search: string = "";
  $: search;

  function handleClose() {
    goto($page.url.pathname);
  }

  $: searching = false;
  let debounceTimeout: NodeJS.Timeout;
  async function updateResults() {
    clearTimeout(debounceTimeout);
    searching = true;
    debounceTimeout = setTimeout(async () => {
      if (emptyString(search)) {
        results = [];
        searching = false;
        return;
      }
      if (!isOrgGroup) {
        const groupMembersQuery = query(
          collection(db, `organizations/${organization.id}/groups/${group.id}/members`),
          orderBy("handle", "asc"),
          where("handle", ">=", search),
          where("handle", "<=", `${search}~`),
          limit(5)
        );
        const snapshotGroupMembers = await getDocs(groupMembersQuery);
        groupMembers = snapshotGroupMembers.docs.length
          ? snapshotGroupMembers.docs.map((doc) => makeDocument<Member>(doc))
          : [];
      }
      const orgMembersQuery = query(
        collection(db, `organizations/${organization.id}/groups/${organization.id}/members`),
        orderBy("handle", "asc"),
        where("handle", ">=", search),
        where("handle", "<=", `${search}~`),
        limit(5)
      );
      const profilesQuery = query(
        collection(db, "profiles"),
        orderBy("handle", "asc"),
        where("handle", ">=", search),
        where("handle", "<=", `${search}~`),
        limit(5)
      );
      const snapshotOrgMembers = await getDocs(orgMembersQuery);
      const snapshotProfiles = await getDocs(profilesQuery);
      orgMembers = snapshotOrgMembers.docs.length
        ? snapshotOrgMembers.docs.map((doc) => makeDocument<Member>(doc))
        : [];
      profiles = snapshotProfiles.docs.length
        ? snapshotProfiles.docs.map((doc) => makeDocument<Profile>(doc))
        : [];

      results = profiles.map((profile) => ({
        profile,
        orgMember: orgMembers.find((m) => m.id === profile.id) ?? null,
        groupMember: groupMembers.find((m) => m.id === profile.id) ?? null
      }));

      searching = false;
    }, 500);
  }

  function addInvitee(profile: Profile) {
    if (invitees.find((invitee) => invitee.id === profile.id)) {
      return;
    }
    invitees = [profile, ...invitees];
  }

  function removeInvitee(profile: Profile) {
    const remove = invitees.findIndex((invitee) => invitee.id === profile.id);
    if (remove > -1) {
      let next = invitees.slice();
      next.splice(remove, 1);
      invitees = next;
    }
  }

  beforeNavigate(() => {
    search = "";
    profiles = [];
    orgMembers = [];
    groupMembers = [];
    results = [];
    invitees = [];
  });
</script>

<dialog bind:this={modalEl} id="invite" class="modal" class:modal-open={open}>
  <div class="modal-box">
    {#if isOrgGroup}
      <p class="mb-4">
        Invite new members to <strong class="text-primary">{organization.name}</strong>
      </p>
      <p class="mb-4 text-sm text-neutral">Members must have a completed profile.</p>
    {:else}
      <p class="mb-4">
        Invite <strong class="text-primary">{organization.name}</strong> members to
        <strong class="text-success">{group.name}</strong>
      </p>
      <p class="mb-4 text-sm text-neutral">
        Members must have a completed profile and accepted an invitation to <strong
          >{organization.name}</strong
        >
      </p>
    {/if}
    {#if invitees.length}
      <form
        class="card bg-base-200 flex flex-col mb-6"
        method="post"
        action="?/sendInvitations"
        use:enhance={workingCallback({
          reset: true,
          invalidateAll: true
        })}
      >
        <input type="hidden" name="organization_id" value={organization.id} />
        <input type="hidden" name="organization_name" value={organization.name} />
        <input type="hidden" name="group_id" value={group.id} />
        <input type="hidden" name="group_name" value={group.name} />
        <input type="hidden" name="user_id" value={$user?.uid} />
        <input type="hidden" name="profile_handle" value={$profile?.handle} />
        <div class="card-body p-4">
          <p>Invitations</p>
          <ul class="menu p-0">
            {#each invitees as invitee (invitee.id)}
              <li>
                <label class="flex">
                  <input
                    type="hidden"
                    name={`invitee-${invitee.handle}[handle]`}
                    value={invitee.handle}
                  />
                  <input type="hidden" name={`invitee-${invitee.handle}[id]`} value={invitee.id} />
                  <img
                    src={invitee.photo_url ?? "/user.png"}
                    class="avatar rounded-full w-10 bg-success"
                    alt={invitee.name}
                  />
                  <ProfileLink handle={invitee.handle} />
                  {invitee.name}
                  <span class="flex-1" />
                  <input
                    type="checkbox"
                    class="checkbox checkbox-sm checkbox-success hover:checkbox-secondary"
                    checked
                    on:change={() => removeInvitee(invitee)}
                  />
                </label>
              </li>
            {/each}
          </ul>
          <div class="card-actions justify-end">
            <button class="btn btn-sm btn-primary">
              <span class="material-symbols-outlined">person_add</span>
              Send Invitations
            </button>
          </div>
        </div>
      </form>
    {/if}
    <div class="relative">
      <span
        class="material-symbols-outlined absolute flex justify-center items-center w-12 h-full pointer-events-none"
      >
        {#if searching}
          <span class="loading" />
        {:else}
          search
        {/if}
      </span>
      <input
        type="text"
        id="search"
        name="search"
        autocomplete="off"
        spellcheck="false"
        placeholder={isOrgGroup ? "Search profiles" : "Search members"}
        class="input input-bordered w-full pl-12"
        bind:value={search}
        on:input={updateResults}
      />
    </div>
    {#if results.length}
      <ul class="menu p-0 mt-4">
        {#each results as result (result.profile.id)}
          <li>
            <button
              class="flex"
              on:click={() => {
                if (isOrgGroup && result.orgMember) {
                  // inviting to organization and the user is already a member
                  return;
                }
                if (!isOrgGroup && result.groupMember) {
                  // inviting to group and the user is already a member
                  return;
                }
                if (!isOrgGroup && !result.orgMember) {
                  // inviting to group and the user is not an org member
                  return;
                }
                // ok to go
                addInvitee(result.profile);
              }}
            >
              <img
                src={result.profile.photo_url ?? "/user.png"}
                class="avatar rounded-full w-10 bg-success"
                alt={result.profile.name}
              />
              <ProfileLink handle={result.profile.handle} />
              {result.profile.name}
              <div class="flex-1" />
              {#if result.orgMember}
                <div class="badge badge-primary">{organization.name}</div>
              {/if}
              {#if !isOrgGroup && !result.orgMember}
                <div class="badge badge-secondary">No access</div>
              {/if}
              {#if !isOrgGroup && result.groupMember}
                <div class="badge badge-success">{group.name}</div>
              {/if}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop" on:submit={handleClose}>
    <button>close</button>
  </form>
</dialog>
