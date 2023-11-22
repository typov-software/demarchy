<script lang="ts">
  export let photo_url: string | undefined;
  export let name: string | undefined;

  let initials = name
    ?.split(' ')
    .map((part) => part.at(0))
    .join('');
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
    <ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
      <!-- Sidebar content here -->
      <li><a>Sidebar Item 1</a></li>
      <li><a>Sidebar Item 2</a></li>
    </ul>
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
</style>
