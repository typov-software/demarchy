<script lang="ts">
  import type { Organization } from '$lib/models/organizations';
  import type { Profile } from '$lib/models/profiles';
  import { onMount } from 'svelte';
  import UserNav from './UserNav.svelte';
  import { doc, onSnapshot } from 'firebase/firestore';
  import { db, user } from '$lib/firebase';
  import type { Inbox, InboxProps } from '$lib/models/inboxes';
  import DemarchyDLoader from './DemarchyDLoader.svelte';

  export let organization: Organization | undefined;
  export let organizations: Organization[];
  export let profile: Profile;
  export let loading: boolean;

  let inbox: Inbox | undefined;

  onMount(() => {
    const inboxRef = doc(db, 'inboxes', $user!.uid);
    const unsubscribe = onSnapshot(inboxRef, (snapshot) => {
      inbox = {
        id: snapshot.id,
        ...(snapshot.data() as InboxProps)
      };
    });
    return () => unsubscribe();
  });
</script>

<header class="flex flex-row items-center z-50 p-3 gap-2">
  <a href="/d" title="Dashboard">
    <DemarchyDLoader {loading} />
  </a>

  <div class="flex flex-1">
    {#if organizations.length}
      <div class="org-select dropdown dropdown-bottom">
        {#if organization}
          <div tabindex="0" role="button" class="btn btn-sm btn-primary rounded-xl">
            {organization.name}
          </div>
        {:else}
          <div tabindex="0" role="button" class="btn-warning btn-sm btn rounded-xl">
            Select organization
          </div>
        {/if}

        <ul class="menu w-60 dropdown-content z-[1] shadow bg-base-300 rounded-box -left-4">
          {#each organizations as org}
            <li>
              <a href={'/d/' + org.slug} title={org.name}>{org.name}</a>
            </li>
          {/each}
        </ul>
      </div>
    {:else}
      <a href="/d/organizations/new" class="btn btn-primary btn-sm rounded-xl"
        >Create organization</a
      >
    {/if}
  </div>

  <UserNav photo_url={profile?.photo_url} name={profile?.name} {inbox} />
</header>
