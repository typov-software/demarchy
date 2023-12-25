<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/firebase';
  import { theme, toggleTheme } from '$lib/stores/themes';
  import { signOut } from 'firebase/auth';

  export let photo_url: string | undefined;
  export let name: string | undefined;

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
          </div>
        </div>
      {:else}
        <div class="avatar placeholder">
          <div class="rounded-xl bg-neutral text-neutral-content">
            <span>{initials}</span>
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
          <a href="/d/profile" on:click={closeDrawer} class="rounded-none" title="Your profile">
            <span class="material-symbols-outlined">person</span>
            Your profile
          </a>
        </li>
        <li>
          <a href="/d/vouchers" on:click={closeDrawer} class="rounded-none" title="Your vouchers">
            <span class="material-symbols-outlined">toll</span>
            Your vouchers
          </a>
        </li>
        <li>
          <a href="/d/settings" on:click={closeDrawer} class="rounded-none" title="Your settings">
            <span class="material-symbols-outlined">tune</span>
            Your settings
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
</style>
