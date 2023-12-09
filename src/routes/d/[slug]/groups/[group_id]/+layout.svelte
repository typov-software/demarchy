<script lang="ts">
  import { page } from '$app/stores';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  let groupsPath = `/d/${$page.params.slug}/groups`;
  let groupPath = `${groupsPath}/${data.group!.id}`;
  let invitationsPath = `${groupPath}/invitations`;
  let settingsPath = `${groupPath}/settings`;
</script>

<div class="flex flex-col sm:flex-row flex-1 h-full min-h-full w-full">
  <ul class="menu bg-base-200 sm:w-56 min-h-full">
    <li><a href={invitationsPath}>Invitations</a></li>
    <li><a href={settingsPath}>Settings</a></li>
  </ul>

  <div class="flex flex-col h-full w-full">
    <slot />
  </div>
</div>
