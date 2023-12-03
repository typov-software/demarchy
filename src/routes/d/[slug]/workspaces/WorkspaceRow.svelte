<script lang="ts">
  import { getRoleName, type RoleAccess } from '$lib/models/roles';
  import type { Workspace } from '$lib/models/workspaces';

  export let slug: string;
  export let workspace: Workspace;
  export let role: RoleAccess;
  let allowed = ['obs', 'mem', 'mod', 'adm'].includes(role);
</script>

<tr>
  <td>
    {#if allowed}
      <a href="/d/{slug}/workspaces/{workspace.id}" class="link link-hover text-primary">
        {workspace.name}
      </a>
    {:else}
      {workspace.name}
    {/if}
  </td>
  <td class="truncate">
    {workspace.description}
  </td>
  <td>
    {getRoleName(role)}
  </td>
  <td>
    <div class="dropdown dropdown-end">
      <button tabindex="0" class="btn btn-square btn-ghost" disabled={!allowed}>|</button>
      <div class="dropdown-content z-[1] shadow bg-base-300">
        <ul class="menu p-0 w-60">
          <li>
            <a href="/d/{slug}/workspaces/{workspace.id}">Members</a>
          </li>
          <li>
            <a href="/d/{slug}/workspaces/{workspace.id}/invitations">Invitations</a>
          </li>
          <li>
            <a href="/d/{slug}/workspaces/{workspace.id}/settings">Settings</a>
          </li>
        </ul>
      </div>
    </div>
  </td>
</tr>
