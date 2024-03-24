<script lang="ts">
  import { page } from "$app/stores";
  import BasicSection from "$lib/components/BasicSection.svelte";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import { formatRelative } from "date-fns";
  import type { PageData } from "./$types";
  import { enhance } from "$app/forms";
  import { workingCallback } from "$lib/stores/working";

  export let data: PageData;
</script>

<BasicSection>
  <div class="flex flex-row w-full items-center">
    <Breadcrumbs organization={data.organization} groups={data.allowed_groups} group={data.group} />
    <div class="flex flex-1" />

    {#if data.can_write}
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-sm btn-square btn-primary">
          <span class="material-symbols-outlined">more_vert</span>
        </div>
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <div tabindex="0" class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
          <form
            id="create-proposal"
            method="post"
            action="?/createProposal"
            use:enhance={workingCallback()}
          >
            <input type="hidden" name="organization_id" value={data.organization.id} />
            <input type="hidden" name="group_id" value={data.group.id} />
            <input type="hidden" name="profile_handle" value={data.profile.handle} />
          </form>
          <ul class="menu w-60">
            <li>
              <button type="submit" form="create-proposal">
                <span class="material-symbols-outlined">add</span>
                New Proposal
              </button>
            </li>
          </ul>
        </div>
      </div>
    {/if}
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
          {#each data.drafts as proposal (proposal.id)}
            <tr>
              <td>
                <a href={$page.url.pathname + "/" + proposal.id} class="link">
                  <span>{proposal.title}</span>
                </a>
              </td>
              <td class="text-right text-neutral">
                <span>{formatRelative(proposal.updated_at, new Date())}</span>
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
            <th>Open proposals</th>
            <th class="text-right">Last updated</th>
          </tr>
        </thead>
        <tbody>
          {#each data.open as proposal (proposal.id)}
            <tr>
              <td>
                <a href={$page.url.pathname + "/" + proposal.id} class="link link-hover">
                  <span>{proposal.title}</span>
                </a>
              </td>
              <td class="text-right text-neutral">
                <span>{formatRelative(proposal.updated_at, new Date())}</span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  {#if data.adopted.length}
    <div class="flex flex-col w-full">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Adopted proposals</th>
            <th class="text-right">Last updated</th>
          </tr>
        </thead>
        <tbody>
          {#each data.adopted as proposal (proposal.id)}
            <tr>
              <td>
                <a href={$page.url.pathname + "/" + proposal.id} class="link">
                  <span>{proposal.title}</span>
                </a>
              </td>
              <td class="text-right text-neutral">
                <span>{formatRelative(proposal.updated_at, new Date())}</span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</BasicSection>
