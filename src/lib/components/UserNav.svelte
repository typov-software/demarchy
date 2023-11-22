<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/firebase';
  import { signOut } from 'firebase/auth';

  export let photo_url: string | undefined;
  export let name: string | undefined;

  let initials = name
    ?.split(' ')
    .map((part) => part.at(0))
    .join('');

  function closeDrawer() {
    const node = document.querySelector('[for="user-nav"].drawer-overlay');
    node?.dispatchEvent(new MouseEvent('click'));
  }

  async function endSession() {
    const res = await fetch('/api/session', { method: 'DELETE' });
    await signOut(auth);
    await goto('/login');
  }
</script>

<div class="drawer drawer-end w-auto">
  <input id="user-nav" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <!-- Page content here -->
    <label for="user-nav" class="drawer-button">
      {#if photo_url}
        <div class="avatar">
          <div class="rounded-full">
            <img src={photo_url} alt={name} />
          </div>
        </div>
      {:else}
        <div class="avatar placeholder">
          <div class="rounded-full bg-neutral text-neutral-content">
            <span>{initials}</span>
          </div>
        </div>
      {/if}
    </label>
  </div>
  <div class="drawer-side">
    <label for="user-nav" aria-label="close sidebar" class="drawer-overlay" />

    <div class="min-h-full bg-base-100 text-base-content flex flex-col">
      <div class="flex flex-row items-center justify-between h-16 ml-3 mr-3">
        {#if photo_url}
          <div class="avatar">
            <div class="rounded-full">
              <img src={photo_url} alt={name} />
            </div>
          </div>
        {:else}
          <div class="avatar placeholder">
            <div class="rounded-full bg-neutral text-neutral-content">
              <span>{initials}</span>
            </div>
          </div>
        {/if}

        <span class="flex flex-1 p-3 mt-2">
          {name}
        </span>

        <button class="btn btn-square btn-ghost" on:click={closeDrawer}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_66_373)">
              <path
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                class="fill-target"
              />
            </g>
            <defs>
              <clipPath id="clip0_66_373">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </button>
      </div>

      <ul class="menu">
        <li>
          <a href="/app/profile" on:click={closeDrawer}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_154_116)">
                <path
                  d="M12 12C14.21 12 16 10.21 16 8.00003C16 5.79003 14.21 4.00003 12 4.00003C9.79 4.00003 8 5.79003 8 8.00003C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                  class="fill-target"
                />
              </g>
              <defs>
                <clipPath id="clip0_154_116">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
            Your profile
          </a>
        </li>
        <li>
          <a href="/app/settings" on:click={closeDrawer}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_154_121)">
                <path
                  d="M3 17V19H9V17H3ZM3 5.00003V7.00003H13V5.00003H3ZM13 21V19H21V17H13V15H11V21H13ZM7 9.00003V11H3V13H7V15H9V9.00003H7ZM21 13V11H11V13H21ZM15 9.00003H17V7.00003H21V5.00003H17V3.00003H15V9.00003Z"
                  class="fill-target"
                />
              </g>
              <defs>
                <clipPath id="clip0_154_121">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>

            Your settings
          </a>
        </li>
      </ul>
      <div class="divider" />
      <ul class="menu">
        <li>
          <button on:click={endSession}> Sign out </button>
        </li>
      </ul>
    </div>
  </div>
</div>

<style lang="scss">
  .avatar {
    top: 0.2rem;
  }
  .avatar .rounded-full {
    width: 40px;
    height: 40px;
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
