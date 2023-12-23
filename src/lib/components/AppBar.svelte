<script lang="ts">
  import type { Organization } from '$lib/models/organizations';
  import type { Profile } from '$lib/models/profiles';
  import { onMount } from 'svelte';
  import UserNav from './UserNav.svelte';
  import { doc, onSnapshot } from 'firebase/firestore';
  import { db, user } from '$lib/firebase';
  import type { Inbox, InboxProps } from '$lib/models/inboxes';
  import DemarchyDLoader from './DemarchyDLoader.svelte';
  import { scale } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';

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
          <div tabindex="0" role="button" class="btn btn-sm rounded-xl">
            {organization.name}
          </div>
        {:else}
          <div tabindex="0" role="button" class="text-warning btn-sm btn rounded-xl">
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

  <a href="/d/discussions" class="btn btn-square" title="Your Discussions">
    <span class="material-symbols-outlined">forum</span>
  </a>

  <a href="/d/proposals" class="btn btn-square" title="Your Proposals">
    <span class="material-symbols-outlined">history_edu</span>
  </a>

  <a href="/d/inbox" class="btn btn-square relative -z-10" title="Inbox">
    <span class="material-symbols-outlined">inbox</span>
    {#if inbox?.unread}
      <mark
        class="mark w-3 h-3 -top-0.5 -right-0.5 bg-accent absolute"
        in:scale={{ start: 0, easing: elasticOut, duration: 2000 }}
      />
    {/if}
  </a>

  <UserNav photo_url={profile?.photo_url} name={profile?.name} />
</header>

<style lang="scss">
  mark {
    border-radius: 40%;
    transform: rotate(45deg);
  }
</style>
