<script lang="ts">
  import { enhance } from '$app/forms';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { working, workingCallback } from '$lib/stores/working';
  import GroupCard from '../GroupCard.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  let isOrgGroup = data.organization.id === data.group.id;
  $: isOrgGroup;
</script>

<BasicSection>
  <div class="flex flex-row w-full items-center">
    <Breadcrumbs organization={data.organization} groups={data.allowed_groups} group={data.group} />

    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-sm btn-square btn-primary">
        <span class="material-symbols-outlined">more_vert</span>
      </div>
      <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
        <ul class="menu w-60">
          <li>
            <a href={`/d/${data.organization.slug}/groups/new`}>
              <span class="material-symbols-outlined">add</span>
              Create a new Group
            </a>
          </li>
          {#if !data.can_write}
            <li>
              <form
                id="submit-application"
                method="post"
                action="?/submitApplication"
                class="hidden"
                use:enhance={workingCallback({ invalidateAll: true })}
              >
                <input type="hidden" name="profile_handle" value={data.profile.handle} />
                <input type="hidden" name="organization_id" value={data.organization.id} />
                <input type="hidden" name="group_id" value={data.group.id} />
                <input
                  type="hidden"
                  name="text"
                  value={`You requested an invitation to ${
                    isOrgGroup
                      ? data.organization.name
                      : data.organization.name + ' > ' + data.group.name
                  }`}
                />
              </form>
              <button
                form="submit-application"
                disabled={$working.length > 0}
                class="flex items-center w-full"
                title="Apply for membership"
              >
                <span class="material-symbols-outlined">approval</span>
                {data.application ? 'Application pending' : 'Request an Invitation'}
              </button>
            </li>
          {/if}
        </ul>
      </div>
    </div>
  </div>

  {#if !data.can_write}
    <div class="card">
      <div class="card-body flex flex-col p-4 gap-4 items-center text-center">
        <h3 class="text-2xl font-bold">Request an invitation</h3>
        <p class="w-full sm:max-w-md">
          As member of {data.organization.name}, you can view this group's resources &mdash; but
          only full members of {data.group.name} may participate in feedback, discussions, and proposals.
        </p>
        <button
          form={data.application ? '' : 'submit-application'}
          class="btn btn-primary max-w-xs w-full mt-2"
          class:btn-warning={data.application}
        >
          {data.application ? 'Application pending' : 'Request an Invitation'}
        </button>
      </div>
    </div>
  {/if}

  <div class="flex flex-col w-full max-w-3xl gap-8">
    <div class="flex flex-col gap-6 border-2 border-base-200 p-6 rounded-box">
      <div class="flex flex-col gap-2">
        <h3 class="text-2xl">Manage Access</h3>
        <p>
          Invite new {isOrgGroup ? 'Organization' : 'group'} members and see existing ones.
        </p>
      </div>

      {#each [data.group.id] as group_id (group_id)}
        <GroupCard
          group={data.group}
          organization={data.organization}
          memberships={data.memberships}
          subroute="/access"
          title="Manage access"
        />
      {/each}
    </div>
  </div>

  {#if data.can_write}
    <div class="card">
      <div class="card-body flex flex-col p-4 gap-4 items-center text-center">
        <h3 class="text-2xl font-bold">
          {isOrgGroup ? data.organization.name : data.group.name} wants your feedback
        </h3>
        <p class="w-full sm:max-w-md">
          Tell the group what it needs to hear &mdash; share your experience, suggestions, and
          concerns as yourself or anonymously.
        </p>
        <a
          href={`/d/${data.organization.slug}/${data.group.slug}/feedback`}
          class="btn btn-primary max-w-xs w-full mt-2"
        >
          Share Feedback
        </a>
      </div>
    </div>
  {/if}
</BasicSection>
