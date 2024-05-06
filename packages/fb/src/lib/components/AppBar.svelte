<script lang="ts">
  import type { Organization } from '$lib/models/organizations';
  import type { Profile } from '$lib/models/profiles';
  import { onMount } from 'svelte';
  import UserNav from './UserNav.svelte';
  import { doc, onSnapshot } from 'firebase/firestore';
  import { db, user } from '$lib/firebase';
  import type { Inbox } from '$lib/models/inboxes';
  import DemarchyDLoader from './DemarchyDLoader.svelte';
  import { makeDocument } from '$lib/models/utils';

  export let organization: Organization | undefined;
  export let organizations: Organization[];
  export let profile: Profile;
  export let loading: boolean;

  let inbox: Inbox | undefined;

  onMount(() => {
    const inboxRef = doc(db, 'inboxes', $user!.uid);
    const unsubscribe = onSnapshot(inboxRef, (snapshot) => {
      inbox = makeDocument<Inbox>(snapshot);
    });
    return () => unsubscribe();
  });
</script>

<header class="flex flex-row items-center z-50 px-3 pt-2 pb-1 gap-2">
  <a href="/d" title="Dashboard">
    <DemarchyDLoader {loading} />
  </a>

  <div class="flex flex-1">
    {#if organizations.length}
      <div class="org-select dropdown dropdown-bottom">
        {#if organization}
          <div tabindex="0" role="button" class="btn btn-sm btn-primary">
            {organization.name}
          </div>
        {:else}
          <div tabindex="0" role="button" class="btn-sm btn">Select organization</div>
        {/if}

        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <ul
          tabindex="0"
          class="menu w-60 dropdown-content z-[1] shadow bg-base-300 rounded-box -left-5"
        >
          {#each organizations as org (org.id)}
            <li>
              <a href={'/d/' + org.slug} title={org.name}>{org.name}</a>
            </li>
          {/each}
        </ul>
      </div>
    {:else}
      <a href="/d/organizations/new" class="btn btn-primary btn-sm">Create organization</a>
    {/if}
  </div>

  <UserNav photo_url={profile?.photo_url} name={profile?.name} {inbox} />
</header>
