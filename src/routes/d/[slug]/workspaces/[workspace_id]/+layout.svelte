<script lang="ts">
  import { page } from '$app/stores';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  let workspacesPath = `/d/${$page.params.slug}/workspaces`;
  let workspacePath = `${workspacesPath}/${data.workspace!.id}`;
  let invitationsPath = `${workspacePath}/invitations`;
</script>

<div class="flex flex-col sm:flex-row flex-1 h-full min-h-full w-full">
  <ul class="menu bg-base-200 sm:w-56 min-h-full">
    <li><a href={workspacePath}>Access</a></li>
    <li><a href={invitationsPath}>Invitations</a></li>
  </ul>

  <div class="flex flex-col h-full w-full">
    <slot />
  </div>
</div>
