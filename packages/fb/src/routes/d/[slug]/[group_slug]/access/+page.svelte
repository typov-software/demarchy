<script lang="ts">
  import { page } from '$app/stores';
  import { type OrderByDirection } from 'firebase/firestore';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import { enhance } from '$app/forms';
  import { working, workingCallback } from '$lib/stores/working';
  import { user } from '$lib/firebase';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import ProfileLink from '$lib/components/ProfileLink.svelte';
  import { formatRelative } from 'date-fns';
  import { pluralize } from '$lib/utils/string';
  import InvitationModal from './InvitationModal.svelte';

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
    await goto(`?${searchParams.toString()}`, { invalidateAll: true });
  }
</script>

<BasicSection otherClass="py-0">
  <div class="flex flex-row w-full items-center">
    <Breadcrumbs organization={data.organization} groups={data.allowed_groups} group={data.group} />
  </div>

  {#if data.invitations.length}
    <div class="w-full max-w-3xl">
      <div class="card bg-base-200">
        <div class="card-body px-0 py-4">
          <div class="card-title w-full pl-4 pr-2">
            <span class="flex-1">Invitations</span>

            {#if data.can_write}
              <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-sm btn-square btn-neutral">
                  <span class="material-symbols-outlined">more_vert</span>
                </div>
                <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                <div tabindex="0" class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
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
            {/if}
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
                {#if data.can_write}
                  <div class="dropdown dropdown-end">
                    <button tabindex="0" class="btn btn-sm btn-square btn-ghost">
                      <span class="material-symbols-outlined">more_vert</span>
                    </button>
                    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                    <div tabindex="0" class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
                      <ul class="menu w-64">
                        <li>
                          <form
                            id={`resend-${invitation.invited_user_id}`}
                            method="POST"
                            action="?/resend"
                            use:enhance={workingCallback({ invalidateAll: true })}
                            class="hidden"
                          >
                            <input type="hidden" name="invitation_path" value={invitation.path} />
                          </form>
                          <button
                            form={`resend-${invitation.invited_user_id}`}
                            type="submit"
                            disabled={invitation.user_id !== $user?.uid}
                            class="w-full"
                          >
                            Resend
                          </button>
                        </li>
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
                              <input
                                type="hidden"
                                name="organization_name"
                                value={data.organization.name}
                              />
                              <input type="hidden" name="group_id" value={invitation.group_id} />
                              <input type="hidden" name="group_name" value={data.group.name} />
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
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
  {/if}

  {#if data.applications.length}
    <div class="w-full max-w-3xl">
      <div class="card bg-base-200">
        <div class="card-body px-0 py-4">
          <div class="card-title w-full pl-4 pr-4">
            <span class="flex-1">Applications</span>
            <span class="text-sm">Last 7 days</span>
          </div>
          <ul>
            {#each data.applications as application (application.id)}
              <li class="flex items-center hover:bg-base-300 pl-4 pr-2 py-1">
                <ProfileLink handle={application.profile_handle} />
                <div class="flex-1" />
                <small class="px-2 text-neutral text-xs">
                  {formatRelative(application.created_at, new Date())}
                </small>
                {#if data.can_write}
                  <div class="dropdown dropdown-end">
                    <button tabindex="0" class="btn btn-sm btn-square btn-ghost">
                      <span class="material-symbols-outlined">more_vert</span>
                    </button>
                    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                    <div tabindex="0" class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
                      <ul class="menu w-64">
                        <li>
                          <form
                            id={`accept-application-${application.user_id}`}
                            class="hidden"
                            method="post"
                            action="?/acceptApplication"
                            use:enhance={workingCallback({
                              reset: true,
                              invalidateAll: true,
                            })}
                          >
                            <input type="hidden" name="application_id" value={application.id} />
                            <input
                              type="hidden"
                              name="organization_id"
                              value={data.organization.id}
                            />
                            <input
                              type="hidden"
                              name="organization_name"
                              value={data.organization.name}
                            />
                            <input type="hidden" name="group_id" value={group.id} />
                            <input type="hidden" name="group_name" value={group.name} />
                            <input
                              type="hidden"
                              name="profile_handle"
                              value={data.profile.handle}
                            />
                          </form>
                          <button
                            disabled={$working.length > 0}
                            form={`accept-application-${application.user_id}`}
                            >Send invitation</button
                          >
                        </li>
                      </ul>
                    </div>
                  </div>
                {/if}
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
          <span class="flex-1"
            >{group.member_count.toLocaleString()} {pluralize('Member', group.member_count)}</span
          >
          <div class="dropdown dropdown-end mr-1">
            <div tabindex="0" role="button" class="btn btn-square btn-sm btn-ghost">
              <span class="material-symbols-outlined">sort</span>
            </div>
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <div tabindex="0" class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
              <ul class="menu w-40">
                <li><button on:click={onSort('handle', 'asc')}>Handle ASC</button></li>
                <li><button on:click={onSort('handle', 'desc')}>Handle DESC</button></li>
              </ul>
            </div>
          </div>

          {#if data.can_write}
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-sm btn-square btn-neutral">
                <span class="material-symbols-outlined">more_vert</span>
              </div>
              <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
              <div tabindex="0" class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
                <ul class="menu w-60">
                  {#if !data.invitations.length}
                    <li>
                      <a href="?modal=invite" title="Invite someone">
                        <span class="material-symbols-outlined">person_add</span>
                        Invite someone
                      </a>
                    </li>
                  {/if}
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
          {/if}
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

<InvitationModal
  open={$page.url.searchParams.get('modal') === 'invite'}
  organization={data.organization}
  group={data.group}
/>
