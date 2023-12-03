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

<header class="flex flex-row items-center z-50">
  <AppNav {organizations} />

  <a href="/d">
    <DemarchyDLoader {loading} />
  </a>

  <div class="flex flex-1">
    {#if organization}
      <h2>{organization.name}</h2>
    {/if}
  </div>

  <a href="/d/discussions" class="btn btn-square btn-ghost">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        class="fill-icon"
        d="M21 6H19V15H6V17C6 17.55 6.45 18 7 18H18L22 22V7C22 6.45 21.55 6 21 6ZM17 12V3C17 2.45 16.55 2 16 2H3C2.45 2 2 2.45 2 3V17L6 13H16C16.55 13 17 12.55 17 12Z"
        fill="black"
      />
    </svg>
  </a>

  <a href="/d/proposals" class="btn btn-square btn-ghost">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        class="fill-icon"
        d="M8.99994 4V5.38C8.16994 5.05 7.27994 4.88 6.38994 4.88C4.59994 4.88 2.80994 5.56 1.43994 6.93L4.76994 10.26H5.87994V11.37C6.73994 12.23 7.85994 12.68 8.98994 12.73V15H5.99994V18C5.99994 19.1 6.89994 20 7.99994 20H17.9999C19.6599 20 20.9999 18.66 20.9999 17V4H8.99994ZM7.88994 10.41V8.26H5.60994L4.56994 7.22C5.13994 7 5.75994 6.88 6.38994 6.88C7.72994 6.88 8.97994 7.4 9.92994 8.34L11.3399 9.75L11.1399 9.95C10.6299 10.46 9.94994 10.75 9.21994 10.75C8.74994 10.75 8.28994 10.63 7.88994 10.41ZM18.9999 17C18.9999 17.55 18.5499 18 17.9999 18C17.4499 18 16.9999 17.55 16.9999 17V15H10.9999V12.41C11.5699 12.18 12.0999 11.84 12.5599 11.38L12.7599 11.18L15.5899 14H16.9999V12.59L10.9999 6.62V6H18.9999V17Z"
        fill="black"
      />
    </svg>
  </a>

  <a href="/d/inbox" class="btn btn-square btn-ghost relative -z-10">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_154_52)">
        <path
          class="fill-icon"
          d="M19 3H4.99C3.88 3 3.01 3.89 3.01 5L3 19C3 20.1 3.88 21 4.99 21H19C20.1 21 21 20.1 21 19V5C21 3.89 20.1 3 19 3ZM19 15H15C15 16.66 13.65 18 12 18C10.35 18 9 16.66 9 15H4.99V5H19V15Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_154_52">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
    {#if inbox?.unread}
      <mark class="mark w-3 h-3 -top-1.5 -right-1.5 bg-accent absolute" />
    {/if}
  </a>

  <UserNav photo_url={profile?.photo_url} name={profile?.name} />
</header>

<style lang="scss">
  header {
    padding: 10px;
    gap: 10px;
  }
</style>
