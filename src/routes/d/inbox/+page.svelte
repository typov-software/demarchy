<script lang="ts">
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import { inbox } from '$lib/firebase';
  import { type InboxCategory } from '$lib/models/inboxes';
  import type { PageData } from './$types';
  import NotificationFeed from './NotificationFeed.svelte';

  export let data: PageData;

  let activeCategory: null | InboxCategory;
  $: activeCategory = ($page.url.searchParams.get('category') as InboxCategory) ?? null;

  let notifications = data.notifications.slice();
  $: notifications;
</script>

<BasicSection otherClass="w-full items-stretch">
  {#if $inbox}
    <div class="flex flex-col sm:flex-row md:max-w-4xl md:self-center gap-4 w-full">
      <ul class="menu bg-base-200 rounded-box w-full sm:max-w-56">
        <li>
          <a href="?" class:active={!activeCategory}
            >All notifications
            {#if $inbox.unread > 0}
              <span class="badge badge-sm">{$inbox.unread}</span>
            {/if}
          </a>
        </li>
        <div class="divider m-0 w-full px-0" />
        <li>
          <a href={`?category=applications`} class:active={activeCategory === 'applications'}>
            Applications
            {#if $inbox?.applications > 0}
              <span class="badge badge-sm">{$inbox.applications}</span>
            {/if}
          </a>
        </li>
        <li>
          <a href={`?category=invitations`} class:active={activeCategory === 'invitations'}>
            Invitations
            {#if $inbox?.invitations > 0}
              <span class="badge badge-sm">{$inbox.invitations}</span>
            {/if}
          </a>
        </li>
        <li>
          <a href={`?category=uncategorized`} class:active={activeCategory === 'uncategorized'}>
            Uncategorized
            {#if $inbox?.uncategorized > 0}
              <span class="badge badge-sm">{$inbox.uncategorized}</span>
            {/if}
          </a>
        </li>
        <li>
          <a href={`?category=vouchers`} class:active={activeCategory === 'vouchers'}>
            Vouchers
            {#if $inbox?.vouchers > 0}
              <span class="badge badge-sm">{$inbox.vouchers}</span>
            {/if}
          </a>
        </li>
      </ul>

      <NotificationFeed category={activeCategory} maxResults={10} />
    </div>
  {/if}
</BasicSection>
