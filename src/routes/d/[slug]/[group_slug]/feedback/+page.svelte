<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import type { PageData } from './$types';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import Replies from '$lib/components/Replies.svelte';

  export let data: PageData;
</script>

<BasicSection otherClass="py-0 pb-2">
  <div class="flex flex-row w-full items-center">
    <Breadcrumbs organization={data.organization} groups={data.allowed_groups} group={data.group} />
    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-square btn-sm btn-primary">
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

  <div class="flex flex-col items-center max-w-3xl w-full">
    <Replies
      organizationId={data.organization.id}
      groupId={data.group.id}
      context="feedback"
      contextId={null}
      parent={null}
      depth={0}
    />
  </div>
</BasicSection>
