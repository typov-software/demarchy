<script lang="ts">
  import { profile } from '$lib/firebase';

  let theme: string | null = null;

  function updateTheme(t: string) {
    document.querySelector('html')?.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
  }

  function onToggleMode() {
    const stored = window.localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark').matches;
    const lastTheme = stored ? stored : prefersDark ? 'dark' : 'light';
    if (stored) {
      theme = lastTheme === 'dark' ? 'light' : 'dark';
    } else {
      theme = prefersDark ? 'light' : 'dark';
    }
    updateTheme(theme);
  }

  function applyStored() {
    let stored = window.localStorage.getItem('theme');
    if (stored) {
      theme = stored;
      updateTheme(stored);
    }
  }

  // once the window is available look for localStorage value
  if (typeof window !== 'undefined' && window?.localStorage) {
    applyStored();
  }
</script>

<header class="flex flex-row items-center">
  <button class="btn btn-square btn-ghost">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="d-menu"
    >
      <g clip-path="url(#clip0_154_35)">
        <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" class="fill-target" />
      </g>
      <defs>
        <clipPath id="clip0_154_35">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  </button>

  <div>
    <svg
      width="36"
      height="36"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M26 74V14H62V26H74V62H62V74H26ZM38 62H61.52V26H38V62Z" fill="#FF0000" />
      <path d="M26 86V26H62V38H74V74H62V86H26ZM38 74H61.52V38H38V74Z" fill="#0000FF" />
    </svg>
  </div>

  <div class="flex flex-1" />

  <div class="theme-toggle flex flex-row">
    <span role="img" class="sun">☀️</span>
    <input type="checkbox" class="toggle" checked={theme === 'dark'} on:change={onToggleMode} />
    <span role="img" class="moon">🌘</span>
  </div>

  <button class="btn btn-square btn-ghost">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        class="fill-target"
        d="M21 6H19V15H6V17C6 17.55 6.45 18 7 18H18L22 22V7C22 6.45 21.55 6 21 6ZM17 12V3C17 2.45 16.55 2 16 2H3C2.45 2 2 2.45 2 3V17L6 13H16C16.55 13 17 12.55 17 12Z"
        fill="black"
      />
    </svg>
  </button>

  <button class="btn btn-square btn-ghost">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        class="fill-target"
        d="M8.99994 4V5.38C8.16994 5.05 7.27994 4.88 6.38994 4.88C4.59994 4.88 2.80994 5.56 1.43994 6.93L4.76994 10.26H5.87994V11.37C6.73994 12.23 7.85994 12.68 8.98994 12.73V15H5.99994V18C5.99994 19.1 6.89994 20 7.99994 20H17.9999C19.6599 20 20.9999 18.66 20.9999 17V4H8.99994ZM7.88994 10.41V8.26H5.60994L4.56994 7.22C5.13994 7 5.75994 6.88 6.38994 6.88C7.72994 6.88 8.97994 7.4 9.92994 8.34L11.3399 9.75L11.1399 9.95C10.6299 10.46 9.94994 10.75 9.21994 10.75C8.74994 10.75 8.28994 10.63 7.88994 10.41ZM18.9999 17C18.9999 17.55 18.5499 18 17.9999 18C17.4499 18 16.9999 17.55 16.9999 17V15H10.9999V12.41C11.5699 12.18 12.0999 11.84 12.5599 11.38L12.7599 11.18L15.5899 14H16.9999V12.59L10.9999 6.62V6H18.9999V17Z"
        fill="black"
      />
    </svg>
  </button>

  <button class="btn btn-square btn-ghost">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_154_52)">
        <path
          class="fill-target"
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
  </button>

  <div class="avatar">
    <div class="rounded-full">
      <img src={$profile?.photo_url} alt={$profile?.name} />
    </div>
  </div>
</header>

<style lang="scss">
  header {
    padding: 10px;
    gap: 10px;
  }

  .avatar .rounded-full {
    width: 40px;
    height: 40px;
  }

  [data-theme='dark'] {
    svg path.fill-target {
      fill: #ffffff;
    }
    .theme-toggle {
      .moon {
        opacity: 1;
      }
      .sun {
        opacity: 0.2;
      }
    }
  }
  [data-theme='light'] {
    svg path.fill-target {
      fill: #000000;
    }
    .theme-toggle {
      .moon {
        opacity: 0.2;
      }
      .sun {
        opacity: 1;
      }
    }
  }
</style>
