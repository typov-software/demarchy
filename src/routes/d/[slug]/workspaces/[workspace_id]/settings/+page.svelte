<script lang="ts">
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  let workspacesPath = `/d/${$page.params.slug}/workspaces`;
  let workspacePath = `${workspacesPath}/${data.workspace!.id}`;
  let settingsPath = `${workspacePath}/settings`;
</script>

<div class="text-sm breadcrumbs self-start py-4 px-4">
  <ul>
    <li><a href={workspacesPath}>Workspaces</a></li>
    <li><a href={workspacePath}>{data.workspace?.name}</a></li>
    <li><a href={settingsPath}>Settings</a></li>
  </ul>
</div>

<BasicSection otherClass="py-0">
  <div />
</BasicSection>

<div class="flex-1" />
<PageView />
