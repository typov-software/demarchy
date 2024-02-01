<script lang="ts">
  import ProfileLink from '$lib/components/ProfileLink.svelte';
  import type { Group } from '$lib/models/groups';
  import type { Membership } from '$lib/models/memberships';
  import type { Organization } from '$lib/models/organizations';
  import { getRoleName } from '$lib/models/roles';
  import { emptyString, pluralize } from '$lib/utils/string';
  import { formatRelative } from 'date-fns';

  export let group: Group;
  export let organization: Organization;
  export let memberships: Membership[];
  export let subroute: string = '';

  function getMembershipRole(groupId: string) {
    const membership = memberships.find((mem) => mem.organization_id === organization?.id);
    return membership!.roles[groupId];
  }

  let role = getMembershipRole(group.id);
  let allowed = ['obs', 'mem', 'mod', 'adm'].includes(role);
  let emptyDescription = emptyString(group.description);
</script>

<a
  class="card bg-base-200 border-base-200 border-2 w-full transition-all"
  class:hover:border-success={allowed}
  class:hover:border-base-300={!allowed}
  class:cursor-default={!allowed}
  class:bg-base-300={group.id === organization.id}
  class:border-base-300={group.id === organization.id}
  title={`Load ${group.name}`}
  href={allowed ? `/d/${organization.slug}/${group.slug}${subroute}` : ''}
>
  <div class="card-body p-4">
    <h3 class="card-title justify-between">
      <span>
        {group.name}
      </span>
      <span
        class="badge font-normal"
        class:badge-success={role === 'mem'}
        class:badge-neutral={role === 'obs'}
        class:badge-warning={role === 'mod'}
        class:badge-accent={role === 'adm'}
      >
        {getRoleName(role)}
      </span>
    </h3>
    <p class="" class:italic={emptyDescription}>
      {emptyDescription ? 'No description' : group.description}
    </p>

    <small class="flex flex-wrap gap-x-2 text-neutral">
      Created by
      <ProfileLink handle={group.profile_handle} />
      {formatRelative(group.created_at, new Date())}
      <span class="flex-1" />
      <span class="text-base-content"
        >{group.member_count} {pluralize('member', group.member_count)}</span
      >
    </small>
  </div>
</a>
