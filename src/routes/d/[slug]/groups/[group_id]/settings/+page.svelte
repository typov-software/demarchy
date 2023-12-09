<script lang="ts">
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  let groupsPath = `/d/${$page.params.slug}/groups`;
  let groupPath = `${groupsPath}/${data.group!.id}`;
  let settingsPath = `${groupPath}/settings`;
</script>

<div class="text-sm breadcrumbs self-start py-4 px-4">
  <ul>
    <li><a href={groupsPath}>Groups</a></li>
    <li><a href={groupPath}>{data.group?.name}</a></li>
    <li><a href={settingsPath}>Settings</a></li>
  </ul>
</div>

<BasicSection otherClass="py-0">
  <div />
</BasicSection>

<div class="flex-1" />
<PageView />
