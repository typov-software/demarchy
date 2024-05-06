<script lang="ts">
  import { enhance } from "$app/forms";
  import BasicSection from "$lib/components/BasicSection.svelte";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import { workingCallback } from "$lib/stores/working";
  import type { PageData } from "./$types";

  export let data: PageData;
  let isOrgGroup = data.organization.id === data.group.id;
  $: isOrgGroup;
</script>

{#key data.group.id}
  <BasicSection>
    <div class="flex flex-row w-full items-center">
      <Breadcrumbs
        organization={data.organization}
        groups={data.allowed_groups}
        group={data.group}
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
      {#if !data.can_write}
        <div class="card">
          <div class="card-body p-6">
            <h3 class="card-title">Request an Invitation</h3>
            <p>
              As member of {data.organization.name}, you can view this group's resources &mdash; but
              only full members of {data.group.name} may participate in feedback, discussions, and proposals.
            </p>
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
                    : data.organization.name + " > " + data.group.name
                }`}
              />
            </form>
            <button
              form={data.application ? "" : "submit-application"}
              class="btn btn-success sm:self-center mt-4"
              class:btn-warning={data.application}
            >
              {data.application ? "Application pending" : "Send Application"}
            </button>
          </div>
        </div>
      {/if}

      <div class="card bg-base-200">
        <div class="card-body p-6">
          <div class="flex flex-col gap-2">
            <h3 class="card-title">Manage Access</h3>
            <p>
              Invite new {isOrgGroup ? "Organization" : "group"} members and see existing ones.
            </p>
          </div>
          <a
            href={`/d/${data.organization.slug}/${data.group.slug}/access`}
            class="btn btn-outline bg-base-100 border-primary hover:btn-primary sm:self-center mt-4"
          >
            Find Members</a
          >
        </div>
      </div>

      <div class="card bg-base-200">
        <div class="card-body p-6">
          <h3 class="card-title">Browse Library</h3>
          <p>See docs the group has cultivated and find opportunities for improvement.</p>
          <a
            href={`/d/${data.organization.slug}/${data.group.slug}/docs`}
            class="btn btn-outline bg-base-100 border-primary hover:btn-primary sm:self-center mt-4"
          >
            Read Docs
          </a>
        </div>
      </div>

      <div class="card bg-base-200">
        <div class="card-body p-6">
          <h3 class="card-title">
            {isOrgGroup ? data.organization.name : data.group.name} wants your feedback
          </h3>
          <p>
            Tell the group what it needs to hear &mdash; share your experience, suggestions, and
            concerns as yourself or anonymously.
          </p>
          <a
            href={`/d/${data.organization.slug}/${data.group.slug}/feedback`}
            class="btn btn-outline bg-base-100 border-primary hover:btn-primary sm:self-center mt-4"
          >
            Share Feedback
          </a>
        </div>
      </div>

      <div class="card bg-base-200">
        <div class="card-body p-6">
          <h3 class="card-title">Latest discussions</h3>
          <p>Keep up with the discussions that will lead to new Proposals.</p>
          <a
            href={`/d/${data.organization.slug}/${data.group.slug}/discussions`}
            class="btn btn-outline bg-base-100 border-primary hover:btn-primary sm:self-center mt-4"
          >
            See Discussions
          </a>
        </div>
      </div>

      <div class="card bg-base-200">
        <div class="card-body p-6">
          <h3 class="card-title">Open Proposals</h3>
          <p>Review proposals and vote on amendments to the group's library.</p>
          <a
            href={`/d/${data.organization.slug}/${data.group.slug}/proposals`}
            class="btn btn-outline bg-base-100 border-primary hover:btn-primary sm:self-center mt-4"
          >
            Vote on Proposals
          </a>
        </div>
      </div>
    </div>
  </BasicSection>
{/key}
