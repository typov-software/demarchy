<script lang="ts">
  import type { Organization } from '$lib/models/organizations';
  import type { Profile } from '$lib/models/profiles';
  import { onMount } from 'svelte';
  import AppNav from './AppNav.svelte';
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
  <AppNav {organizations} />

  <a href="/d" title="Dashboard">
    <DemarchyDLoader {loading} />
  </a>

  <div class="flex flex-1">
    {#if organization}
      <h2>{organization.name}</h2>
    {/if}
  </div>

  <a href="/d/discussions" class="btn btn-square" title="Discussions">
    <span class="material-symbols-outlined">forum</span>
  </a>

  <a href="/d/proposals" class="btn btn-square" title="Proposals">
    <span class="material-symbols-outlined">history_edu</span>
  </a>

  <a href="/d/inbox" class="btn btn-square relative -z-10" title="Inbox">
    <span class="material-symbols-outlined">inbox</span>
    {#if inbox?.unread}
      <mark class="mark w-3 h-3 -top-1.5 -right-1.5 bg-accent absolute" />
    {/if}
  </a>

  <UserNav photo_url={profile?.photo_url} name={profile?.name} />
</header>
