<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import type { LayoutData } from './$types';
  import { useOrganization } from '$lib/stores/organization';

  export let data: LayoutData;

  /**
   * Take the loaded organization and
   */
  let organization = useOrganization();
  onMount(() => {
    organization.set(data.organization);
    return () => {
      organization.set(undefined);
    };
  });
</script>

<nav class="flex flex-row flex-wrap px-2">
  <a href="/d/{data.slug}" class:active={$page.url.pathname.endsWith(data.slug)}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_176_35)">
        <path
          d="M4 6H2V20C2 21.1 2.9 22 4 22H18V20H4V6ZM20 2H8C6.9 2 6 2.9 6 4V16C6 17.1 6.9 18 8 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM19 11H9V9H19V11ZM15 15H9V13H15V15ZM19 7H9V5H19V7Z"
          class="fill-icon"
        />
      </g>
      <defs>
        <clipPath id="clip0_176_35">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
    <span>Libraries</span>
  </a>

  <a href="/d/{data.slug}/proposals" class:active={$page.route.id?.match(/proposals/g)}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.99994 4V5.38C8.16994 5.05 7.27994 4.88 6.38994 4.88C4.59994 4.88 2.80994 5.56 1.43994 6.93L4.76994 10.26H5.87994V11.37C6.73994 12.23 7.85994 12.68 8.98994 12.73V15H5.99994V18C5.99994 19.1 6.89994 20 7.99994 20H17.9999C19.6599 20 20.9999 18.66 20.9999 17V4H8.99994ZM7.88994 10.41V8.26H5.60994L4.56994 7.22C5.13994 7 5.75994 6.88 6.38994 6.88C7.72994 6.88 8.97994 7.4 9.92994 8.34L11.3399 9.75L11.1399 9.95C10.6299 10.46 9.94994 10.75 9.21994 10.75C8.74994 10.75 8.28994 10.63 7.88994 10.41ZM18.9999 17C18.9999 17.55 18.5499 18 17.9999 18C17.4499 18 16.9999 17.55 16.9999 17V15H10.9999V12.41C11.5699 12.18 12.0999 11.84 12.5599 11.38L12.7599 11.18L15.5899 14H16.9999V12.59L10.9999 6.62V6H18.9999V17Z"
        class="fill-icon"
      />
    </svg>
    <span>Proposals</span>
  </a>

  <a href="/d/{data.slug}/discussions" class:active={$page.route.id?.match(/discussions/g)}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 6H19V15H6V17C6 17.55 6.45 18 7 18H18L22 22V7C22 6.45 21.55 6 21 6ZM17 12V3C17 2.45 16.55 2 16 2H3C2.45 2 2 2.45 2 3V17L6 13H16C16.55 13 17 12.55 17 12Z"
        class="fill-icon"
      />
    </svg>
    <span>Discussions</span>
  </a>

  <a href="/d/{data.slug}/activity" class:active={$page.route.id?.match(/activity/g)}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.06 9.94L12 9L14.06 8.06L15 6L15.94 8.06L18 9L15.94 9.94L15 12L14.06 9.94ZM4 14L4.94 11.94L7 11L4.94 10.06L4 8L3.06 10.06L1 11L3.06 11.94L4 14ZM8.5 9L9.59 6.59L12 5.5L9.59 4.41L8.5 2L7.41 4.41L5 5.5L7.41 6.59L8.5 9ZM4.5 20.5L10.5 14.49L14.5 18.49L23 8.93L21.59 7.52L14.5 15.49L10.5 11.49L3 19L4.5 20.5Z"
        class="fill-icon"
      />
    </svg>
    <span>Activity</span>
  </a>

  <a href="/d/{data.slug}/workspaces" class:active={$page.route.id?.match(/workspaces/g)}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_176_189)">
        <path
          d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"
          class="fill-icon"
        />
      </g>
      <defs>
        <clipPath id="clip0_176_189">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
    <span>Workspaces</span>
  </a>
</nav>

<slot />

<style lang="scss">
  nav {
    border-bottom: 1px solid oklch(var(--b2));
  }

  nav a {
    @apply flex;
    @apply gap-x-1;
    padding: 0.5rem 0.5rem;
    margin-right: 0.2rem;
    box-sizing: border-box;

    &.active {
      border-bottom: 2px solid oklch(var(--s));
      font-weight: 600;
    }
  }
</style>
