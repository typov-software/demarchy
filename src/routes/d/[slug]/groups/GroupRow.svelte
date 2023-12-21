<script lang="ts">
  import { getRoleName, type RoleAccess } from '$lib/models/roles';
  import type { Group } from '$lib/models/groups';

  export let slug: string;
  export let group: Group;
  export let role: RoleAccess;
  let allowed = ['obs', 'mem', 'mod', 'adm'].includes(role);
</script>

<tr class="hover">
  <td>
    {#if allowed}
      <a href="/d/{slug}/groups/{group.id}" class="link link-hover">
        {group.name}
      </a>
    {:else}
      {group.name}
    {/if}
  </td>
  <td class="truncate">
    {group.description}
  </td>
  <td>
    {getRoleName(role)}
  </td>
  <td>
    <div class="dropdown dropdown-end">
      <button tabindex="0" class="btn btn-sm btn-square btn-ghost rounded-xl" disabled={!allowed}>
        <span class="material-symbols-outlined">more_vert</span>
      </button>
      <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
        <ul class="menu w-60">
          <li>
            <a href="/d/{slug}/groups/{group.id}">Members</a>
          </li>
          <li>
            <a href="/d/{slug}/groups/{group.id}/invitations">Invitations</a>
          </li>
          <li>
            <a href="/d/{slug}/groups/{group.id}/settings">Settings</a>
          </li>
        </ul>
      </div>
    </div>
  </td>
</tr>
