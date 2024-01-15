<script lang="ts">
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import type { PageData } from '../docs/$types';

  export let data: PageData;

  $: docIds = data.library ? Object.keys(data.library.docs) : [];
</script>

<BasicSection otherClass="!items-start">
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
            <a href="{$page.url.pathname}/todo">
              <span class="material-symbols-outlined">add</span>
              TODO
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>

  {#if data.library && docIds.length}
    <div class="flex flex-col w-full">
      <table class="table w-full">
        <thead>
          <tr>
            <th>{data.group.name} library</th>
          </tr>
        </thead>
        <tbody>
          {#each docIds as docId (docId)}
            <tr>
              <td>
                <a href={$page.url.pathname + '/' + docId} class="link">
                  <span>{data.library.docs[docId].name}</span>
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</BasicSection>
