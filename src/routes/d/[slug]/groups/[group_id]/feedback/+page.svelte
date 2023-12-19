<script lang="ts">
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  let groupsPath = `/d/${$page.params.slug}/groups`;
  let groupPath = `${groupsPath}/${data.group!.id}`;
  let feedbackPath = `${groupPath}/feedback`;
</script>

<div class="text-sm breadcrumbs self-start py-4 px-4">
  <ul>
    <li><a href={groupsPath}>Groups</a></li>
    <li><a href={groupPath}>{data.group?.name}</a></li>
    <li><a href={feedbackPath}>Feedback</a></li>
  </ul>
</div>

<BasicSection otherClass="py-0">
  <div class="flex flex-row w-full items-center">
    <h2 class="flex text-lg">Feedback for {data.group?.name}</h2>
    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost">Actions</div>
      <div class="dropdown-content z-[1] shadow bg-base-300">
        <ul class="menu p-0 w-60">
          <li><a href="{$page.url.pathname}?modal=feedback">Add Feedback</a></li>
        </ul>
      </div>
    </div>
  </div>

  <ul>
    <li class="card"></li>
  </ul>
</BasicSection>
