<script lang="ts">
  import type { Group } from '$lib/models/groups';
  import type { Membership } from '$lib/models/memberships';
  import type { Organization } from '$lib/models/organizations';
  import GroupRow from './GroupRow.svelte';

  export let memberships: Membership[];
  export let organization: Organization;
  export let groups: Group[];
  $: orgGroup = groups.find((ws) => ws.id === organization.id);
  $: groupSpaces = groups.filter((ws) => ws.id !== organization.id);

  function getMembershipRole(wid: string) {
    const membership = memberships.find((mem) => mem.organization_id === organization?.id);
    return membership!.roles[wid];
  }
</script>

<table class="table">
  <thead>
    <tr>
      <th>Name</th>
      <th class="w-full">Description</th>
      <th>Access</th>
      <th />
    </tr>
  </thead>
  <tbody>
    {#if orgGroup}
      <GroupRow slug={organization.slug} group={orgGroup} role={getMembershipRole(orgGroup.id)} />
    {/if}
    {#if groupSpaces.length}
      {#each groupSpaces as group}
        <GroupRow slug={organization.slug} {group} role={getMembershipRole(group.id)} />
      {/each}
    {/if}
  </tbody>
</table>
