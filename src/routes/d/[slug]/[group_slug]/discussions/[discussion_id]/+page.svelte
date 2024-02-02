<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import DiscussionEditor from '../DiscussionEditor.svelte';
  import DiscussionViewer from '../DiscussionViewer.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
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
            <button>
              <span class="material-symbols-outlined">add</span>
              TODO
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div class="w-full">
    {#if data.discussion.state === 'draft' && data.can_write}
      <DiscussionEditor discussion={data.discussion} />
    {:else}
      <DiscussionViewer discussion={data.discussion} can_write={data.can_write} />
    {/if}
  </div>
</BasicSection>
