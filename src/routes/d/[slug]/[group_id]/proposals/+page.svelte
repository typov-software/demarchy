<script lang="ts">
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import { formatRelative } from 'date-fns';
  import type { PageData } from './$types';

  export let data: PageData;

  console.log({
    drafts: data.drafts,
    open: data.open
  });
</script>

<BasicSection>
  <div class="flex flex-row w-full items-center">
    <Breadcrumbs organization={data.organization} groups={data.groups} group={data.group} />
    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-sm btn-square btn-primary rounded-xl">
        <span class="material-symbols-outlined">more_vert</span>
      </div>
      <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
        <ul class="menu w-60">
          <li>
            <a href="{$page.url.pathname}/new">
              <span class="material-symbols-outlined">add</span>
              New Proposal
            </a>
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
          </tr>
        </thead>
        <tbody>
          {#each data.drafts as proposal}
            <tr>
              <td>
                <a href={$page.url.pathname + '/' + proposal.id} class="link">
                  <span>{proposal.title}</span>
                </a>
              </td>
              <td class="text-right text-neutral">
                <span>{formatRelative(proposal.created_at, new Date())}</span>
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
          </tr>
        </thead>
        <tbody>
          {#each data.open as proposal}
            <tr>
              <td>
                <a href={$page.url.pathname + '/' + proposal.id} class="link">
                  <span>{proposal.title}</span>
                </a>
              </td>
              <td class="text-right text-neutral">
                <span>{formatRelative(proposal.created_at, new Date())}</span>
              </td>
              <td class="text-right text-neutral">
                <span>{formatRelative(proposal.created_at, new Date())}</span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</BasicSection>

<PageView />
