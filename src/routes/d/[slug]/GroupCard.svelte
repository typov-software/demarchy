<script lang="ts">
  import ProfileLink from '$lib/components/ProfileLink.svelte';
  import type { Group } from '$lib/models/groups';
  import type { Membership } from '$lib/models/memberships';
  import type { Organization } from '$lib/models/organizations';
  import { pluralize } from '$lib/utils/string';
  import { formatRelative } from 'date-fns';

  export let group: Group;
  export let organization: Organization;
  export let memberships: Membership[];

  function getMembershipRole(groupId: string) {
    const membership = memberships.find((mem) => mem.organization_id === organization?.id);
    return membership!.roles[groupId];
  }

  let allowed = ['obs', 'mem', 'mod', 'adm'].includes(getMembershipRole(group.id));
</script>

<a
  class="card bg-base-200 border-base-200 hover:border-info border-2 w-full transition-all"
  class:bg-base-300={group.id === organization.id}
  class:border-base-300={group.id === organization.id}
  title={`Load ${group.name}`}
  href={allowed ? `/d/${organization.slug}/${group.slug}` : '/'}
>
  <div class="card-body p-6">
    <h3 class="card-title">{group.name}</h3>
    <p class="">{group.description}</p>
    <p class=""></p>

    <small class="flex flex-wrap gap-x-2">
      Created by
      <ProfileLink handle={group.profile_handle} />
      {formatRelative(group.created_at, new Date())}
      <span class="flex-1" />
      <span>{group.member_count} {pluralize('member', group.member_count)}</span>
    </small>
  </div>
</a>
