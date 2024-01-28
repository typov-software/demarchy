<script lang="ts">
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<BasicSection>
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
            <a href="{$page.url.pathname}/new">
              <span class="material-symbols-outlined">add</span>
              Create a new Group
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div class="flex flex-col w-full gap-2">
    <h2 class="text-2xl">{data.group.name}</h2>
    <small>Created {data.group.created_at.toLocaleDateString()} by </small>
    <p>{data.group.description}</p>
  </div>
</BasicSection>
