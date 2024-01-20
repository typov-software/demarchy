<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import BlocksEditor from '$lib/components/BlocksEditor.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<BasicSection otherClass="">
  <div class="flex flex-row w-full items-center">
    <Breadcrumbs organization={data.organization} groups={data.groups} group={data.group} />
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
    <div class="card bg-base-200">
      <div class="card-body py-5 px-0 gap-0">
        <BlocksEditor blocks={data.discussion.blocks} />
      </div>
    </div>
  </div>
</BasicSection>
