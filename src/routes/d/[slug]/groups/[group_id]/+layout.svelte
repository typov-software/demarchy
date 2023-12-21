<script lang="ts">
  import { page } from '$app/stores';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  let groupId = data.group!.id;

  let groupsPath = `/d/${$page.params.slug}/groups`;
  let groupPath = `${groupsPath}/${groupId}`;
  let feedbackPath = `${groupPath}/feedback`;
  let invitationsPath = `${groupPath}/invitations`;
  let settingsPath = `${groupPath}/settings`;
</script>

<div class="flex flex-col sm:flex-row flex-1 h-full min-h-full w-full">
  <ul class="menu bg-base-200 sm:w-56 min-h-full rounded-box m-2">
    <li>
      <a href={groupPath} class:active={$page.url.pathname.endsWith(groupId)} title="Group access">
        Access
      </a>
    </li>
    <li>
      <a
        href={feedbackPath}
        class:active={$page.url.pathname.endsWith('/feedback')}
        title="Group feedback">Feedback</a
      >
    </li>
    <li>
      <a
        href={invitationsPath}
        class:active={$page.url.pathname.endsWith('/invitations')}
        title="Group invitations">Invitations</a
      >
    </li>
    <li>
      <a
        href={settingsPath}
        class:active={$page.url.pathname.endsWith('/settings')}
        title="Group settings">Settings</a
      >
    </li>
  </ul>

  <div class="flex flex-col h-full w-full">
    <slot />
  </div>
</div>
