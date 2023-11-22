<script lang="ts">
  function closeDrawer() {
    const node = document.querySelector('[for="app-nav"].drawer-overlay');
    node?.dispatchEvent(new MouseEvent('click'));
  }
</script>

<div class="drawer w-auto">
  <input id="app-nav" type="checkbox" class="drawer-toggle" />

  <div class="drawer-content">
    <!-- Page content here -->
    <label for="app-nav" class="btn btn-square btn-ghost drawer-button">
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
    </label>
  </div>

  <div class="drawer-side">
    <label for="app-nav" aria-label="close sidebar" class="drawer-overlay" />

    <div class="min-h-full bg-base-100 text-base-content flex flex-col">
      <div class="flex flex-row items-center justify-between h-16 ml-3 mr-3">
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.36011 26.64V5.04001H22.3201V9.36001H26.6401V22.32H22.3201V26.64H9.36011ZM13.6801 22.32H22.1473V9.36001H13.6801V22.32Z"
            fill="#FF0000"
          />
          <path
            d="M9.36011 30.96V9.36001H22.3201V13.68H26.6401V26.64H22.3201V30.96H9.36011ZM13.6801 26.64H22.1473V13.68H13.6801V26.64Z"
            fill="#0000FF"
          />
        </svg>

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
          <a href="/app/dashboard" on:click={closeDrawer}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_154_125)">
                <path
                  d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z"
                  class="fill-target"
                />
              </g>
              <defs>
                <clipPath id="clip0_154_125">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
            Dashboard
          </a>
        </li>
        <li>
          <a href="/app/proposals" on:click={closeDrawer}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.99994 4V5.38C8.16994 5.05 7.27994 4.88 6.38994 4.88C4.59994 4.88 2.80994 5.56 1.43994 6.93L4.76994 10.26H5.87994V11.37C6.73994 12.23 7.85994 12.68 8.98994 12.73V15H5.99994V18C5.99994 19.1 6.89994 20 7.99994 20H17.9999C19.6599 20 20.9999 18.66 20.9999 17V4H8.99994ZM7.88994 10.41V8.26H5.60994L4.56994 7.22C5.13994 7 5.75994 6.88 6.38994 6.88C7.72994 6.88 8.97994 7.4 9.92994 8.34L11.3399 9.75L11.1399 9.95C10.6299 10.46 9.94994 10.75 9.21994 10.75C8.74994 10.75 8.28994 10.63 7.88994 10.41ZM18.9999 17C18.9999 17.55 18.5499 18 17.9999 18C17.4499 18 16.9999 17.55 16.9999 17V15H10.9999V12.41C11.5699 12.18 12.0999 11.84 12.5599 11.38L12.7599 11.18L15.5899 14H16.9999V12.59L10.9999 6.62V6H18.9999V17Z"
                class="fill-target"
              />
            </svg>
            Proposals
          </a>
        </li>
        <li>
          <a href="/app/discussions" on:click={closeDrawer}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 6H19V15H6V17C6 17.55 6.45 18 7 18H18L22 22V7C22 6.45 21.55 6 21 6ZM17 12V3C17 2.45 16.55 2 16 2H3C2.45 2 2 2.45 2 3V17L6 13H16C16.55 13 17 12.55 17 12Z"
                class="fill-target"
              />
            </svg>
            Discussions
          </a>
        </li>
      </ul>

      <div class="divider" />
      <div class="flex flex-1" />
      <div class="divider" />

      <ul class="menu py-4">
        <li>
          <a href="/documentation" on:click={closeDrawer}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_154_130)">
                <path
                  d="M12 11.55C9.64 9.35 6.48 8 3 8V19C6.48 19 9.64 20.35 12 22.55C14.36 20.36 17.52 19 21 19V8C17.52 8 14.36 9.35 12 11.55ZM12 8C13.66 8 15 6.66 15 5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5C9 6.66 10.34 8 12 8Z"
                  class="fill-target"
                />
              </g>
              <defs>
                <clipPath id="clip0_154_130">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>

            Docs
          </a>
        </li>
        <li>
          <a href="/feedback" on:click={closeDrawer}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_154_146)">
                <path
                  d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM13.57 11.57L12 15L10.43 11.57L7 10L10.43 8.43L12 5L13.57 8.43L17 10L13.57 11.57Z"
                  class="fill-target"
                />
              </g>
              <defs>
                <clipPath id="clip0_154_146">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>

            Give feedback
          </a>
        </li>
      </ul>

      <footer class="flex flex-row items-center py-5 ml-4">
        <svg
          width="127"
          height="24"
          viewBox="0 0 127 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M49.4609 17.1131V7.09566H51.9653V4.59131H56.974V7.09566H59.4783V17.1131H56.974V12.1044H51.9653V17.1131H49.4609ZM51.9653 9.60001H56.974V7.19583H51.9653V9.60001Z"
            fill="#0000FF"
          />
          <path
            d="M64.487 17.1131V4.59131H72.0001V7.09566H74.5044V9.60001H72.0001V14.6087H74.5044V17.1131H72.0001V14.6087H69.4957V12.1044H66.9914V17.1131H64.487ZM66.9914 9.60001H71.8999V7.09566H66.9914V9.60001Z"
            fill="#0000FF"
          />
          <path
            d="M82.0175 7.09566V4.59131H87.0262V7.09566H82.0175ZM82.0175 17.1131V14.6087H79.5131V7.09566H82.0175V14.6087H87.0262V17.1131H82.0175ZM87.0262 14.6087V12.1044H89.5305V14.6087H87.0262Z"
            fill="#0000FF"
          />
          <path
            d="M94.5392 17.1131V4.59131H97.0436V9.60001H102.052V4.59131H104.557V17.1131H102.052V12.1044H97.0436V17.1131H94.5392Z"
            fill="#0000FF"
          />
          <path
            d="M114.574 17.1131V9.60001H112.07V7.09566H109.565V4.59131H112.07V7.09566H114.574V9.60001H117.078V17.1131H114.574ZM119.583 7.09566V4.59131H122.087V7.09566H119.583ZM117.078 9.60001V7.09566H119.583V9.60001H117.078Z"
            fill="#0000FF"
          />
          <path
            d="M49.4609 19.6174V9.60001L51.9653 9.60001V7.09566H56.974V9.60001L59.4783 9.60001V19.6174H56.974V14.6087H51.9653V19.6174H49.4609ZM51.9653 12.1044H56.974V9.70018H51.9653V12.1044Z"
            fill="#FF0000"
          />
          <path
            d="M64.487 19.6174V7.09566H72.0001V9.60001H74.5044V12.1044H72.0001V17.1131H74.5044V19.6174H72.0001V17.1131H69.4957V14.6087H66.9914V19.6174H64.487ZM66.9914 12.1044L71.8999 12.1044V9.60001H66.9914V12.1044Z"
            fill="#FF0000"
          />
          <path
            d="M82.0175 9.60001V7.09566H87.0262V9.60001H82.0175ZM82.0175 19.6174V17.1131H79.5131V9.60001H82.0175V17.1131H87.0262V19.6174H82.0175ZM87.0262 17.1131V14.6087H89.5305V17.1131H87.0262Z"
            fill="#FF0000"
          />
          <path
            d="M94.5392 19.6174V7.09566H97.0436V12.1044H102.052V7.09566H104.557V19.6174H102.052V14.6087H97.0436V19.6174H94.5392Z"
            fill="#FF0000"
          />
          <path
            d="M114.574 19.6174V12.1044H112.07V9.60001L109.565 9.60001V7.09566H112.07V9.60001H114.574V12.1044H117.078V19.6174H114.574ZM119.583 9.60001V7.09566H122.087V9.60001L119.583 9.60001ZM117.078 12.1044V9.60001H119.583V12.1044H117.078Z"
            fill="#FF0000"
          />
          <path
            d="M4.38257 17.1131V4.59131H11.8956V7.09566H14.4V14.6087H11.8956V17.1131H4.38257ZM6.88692 14.6087H11.7954V7.09566H6.88692V14.6087Z"
            fill="#FF0000"
          />
          <path
            d="M19.4087 17.1131V4.59131H26.9217V7.09566H21.913V9.60001H26.9217V12.1044H21.913V14.6087H26.9217V17.1131H19.4087Z"
            fill="#FF0000"
          />
          <path
            d="M31.9304 17.1131V4.59131H34.4348V7.09566H36.9391V9.60001H39.4435V12.1044H36.9391V9.60001H34.4348V17.1131H31.9304ZM41.9478 17.1131V9.60001H39.4435V7.09566H41.9478V4.59131H44.4522V17.1131H41.9478Z"
            fill="#FF0000"
          />
          <path
            d="M4.38257 19.6174V7.09566H11.8956V9.60001H14.4V17.1131H11.8956V19.6174H4.38257ZM6.88692 17.1131H11.7954V9.60001H6.88692V17.1131Z"
            fill="#0000FF"
          />
          <path
            d="M19.4087 19.6174V7.09566H26.9217V9.60001H21.913V12.1044H26.9217V14.6087H21.913V17.1131H26.9217V19.6174H19.4087Z"
            fill="#0000FF"
          />
          <path
            d="M31.9304 19.6174V7.09566H34.4348V9.60001H36.9391V12.1044H39.4435V14.6087H36.9391V12.1044L34.4348 12.1044V19.6174H31.9304ZM41.9478 19.6174V12.1044L39.4435 12.1044V9.60001H41.9478V7.09566H44.4522V19.6174H41.9478Z"
            fill="#0000FF"
          />
        </svg>

        <p class="text-sm ml-2 mt-1">&copy; 2023 Typov LLC</p>
      </footer>
    </div>
  </div>
</div>

<style lang="scss">
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
