<script lang="ts">
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import GroupBreadcrumbs from '../GroupBreadcrumbs.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  let group = data.group!;
  let groups = data.groups.slice();
</script>

<GroupBreadcrumbs {group} {groups} />

<BasicSection otherClass="py-0">
  <div class="flex flex-row w-full items-center">
    <h2 class="flex text-lg">Settings for {data.group?.name}</h2>
    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-square btn-sm btn-primary rounded-xl">
        <span class="material-symbols-outlined">more_vert</span>
      </div>
      <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
        <ul class="menu w-60">
          <li>
            <a href="{$page.url.pathname}/todo" title="TODO">
              <span class="material-symbols-outlined">person_add</span>
              TODO
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</BasicSection>

<div class="flex-1" />
<PageView />
