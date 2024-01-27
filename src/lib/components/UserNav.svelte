<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/firebase';
  import type { Inbox } from '$lib/models/inboxes';
  import { theme, toggleTheme } from '$lib/stores/themes';
  import { signOut } from 'firebase/auth';
  import { elasticOut } from 'svelte/easing';
  import { scale } from 'svelte/transition';

  export let photo_url: string | undefined;
  export let name: string | undefined;
  export let inbox: Inbox | undefined;

  $: initials = (name ?? '')
    .split(' ')
    .map((part) => part.at(0))
    .join('');

  function closeDrawer() {
    const node = document.querySelector('[for="user-nav"].drawer-overlay');
    node?.dispatchEvent(new MouseEvent('click'));
  }

  async function endSession() {
    await fetch('/api/session', { method: 'DELETE' });
    await signOut(auth);
    await goto('/login');
  }
</script>

<div class="drawer drawer-end w-auto">
  <input id="user-nav" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <label for="user-nav" class="drawer-button cursor-pointer" title="User Menu">
      {#if photo_url}
        <div class="avatar top-1">
          <div class="rounded-xl">
            <img src={photo_url} alt={name} />
            {#if inbox?.unread}
              <mark
                class="mark w-3 h-3 top-0 right-0 bg-accent absolute"
                in:scale={{ start: 0, easing: elasticOut, duration: 2000 }}
              />
            {/if}
          </div>
        </div>
      {:else}
        <div class="avatar placeholder">
          <div class="rounded-xl bg-neutral text-neutral-content">
            <span>{initials}</span>
            {#if inbox?.unread}
              <mark
                class="mark w-3 h-3 top-0 right-0 bg-accent absolute"
                in:scale={{ start: 0, easing: elasticOut, duration: 2000 }}
              />
            {/if}
          </div>
        </div>
      {/if}
    </label>
  </div>
  <div class="drawer-side">
    <label for="user-nav" aria-label="close sidebar" class="drawer-overlay" />

    <div class="min-h-full bg-base-100 text-base-content flex flex-col">
      <div class="flex flex-row items-center justify-between p-3">
        {#if photo_url}
          <div class="avatar">
            <div>
              <img src={photo_url} alt={name} />
            </div>
          </div>
        {:else}
          <div class="avatar placeholder">
            <div class="bg-neutral text-neutral-content">
              <span>{initials}</span>
            </div>
          </div>
        {/if}

        <p class="p-3 mt-2 truncate">
          {name}
        </p>

        <button class="btn btn-square" on:click={closeDrawer}>
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <ul class="menu">
        <li>
          <a href="/d/inbox" title="Your Inbox" class="rounded-none" on:click={closeDrawer}>
            <span class="material-symbols-outlined relative">
              inbox
              {#if inbox?.unread}
                <mark
                  class="mark w-3 h-3 -top-0.5 -right-0.5 bg-accent absolute"
                  in:scale={{ start: 0, easing: elasticOut, duration: 2000 }}
                />
              {/if}
            </span>
            Your Inbox
          </a>
        </li>

        <li>
          <a href="/d/profile" on:click={closeDrawer} class="rounded-none" title="Your Profile">
            <span class="material-symbols-outlined">person</span>
            Your Profile
          </a>
        </li>

        <li>
          <a
            href="/d/discussions"
            title="Your Discussions"
            class="rounded-none"
            on:click={closeDrawer}
          >
            <span class="material-symbols-outlined">forum</span>
            Your Discussions
          </a>
        </li>

        <li>
          <a href="/d/proposals" title="Your Proposals" class="rounded-none" on:click={closeDrawer}>
            <span class="material-symbols-outlined">history_edu</span>
            Your Proposals
          </a>
        </li>

        <li>
          <a href="/d/vouchers" on:click={closeDrawer} class="rounded-none" title="Your Vouchers">
            <span class="material-symbols-outlined">toll</span>
            Your Vouchers
          </a>
        </li>

        <li>
          <a href="/d/settings" on:click={closeDrawer} class="rounded-none" title="Your Settings">
            <span class="material-symbols-outlined">tune</span>
            Your Settings
          </a>
        </li>

        <li class="rounded-none">
          <label for="theme-toggle" class="theme-toggle flex flex-row rounded-none">
            <span class="material-symbols-outlined">light_mode</span>
            <input
              id="theme-toggle"
              type="checkbox"
              class="toggle"
              checked={$theme === 'dark'}
              on:change={toggleTheme}
            />
            <span class="material-symbols-outlined">dark_mode</span>
          </label>
        </li>
      </ul>

      <div class="divider" />

      <ul class="menu">
        <li>
          <button on:click={endSession} class="rounded-none" title="Sign out">
            <span class="material-symbols-outlined">logout</span>
            Sign out
          </button>
        </li>
      </ul>
    </div>
  </div>
</div>

<style lang="scss">
  .avatar {
    width: 48px;
    height: 48px;
  }

  .avatar > div {
    @apply rounded-full;
  }

  .drawer-side > div {
    width: 360px;
  }

  .menu {
    padding: 0;
  }

  .divider {
    opacity: 0.25;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  mark {
    border-radius: 40%;
    transform: rotate(45deg);
  }
</style>
