<script lang="ts">
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import PageView from '$lib/components/PageView.svelte';
</script>

<BasicSection otherClass="!items-start">
  <div class="flex flex-row w-full items-center">
    <h2>Activity</h2>
    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-sm btn-square btn-primary rounded-xl">
        <span class="material-symbols-outlined">more_vert</span>
      </div>
      <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
        <ul class="menu w-60">
          <li>
            <a href="{$page.url.pathname}/todo">
              <span class="material-symbols-outlined">add</span>
              TODO
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</BasicSection>

<div class="flex-1" />
<PageView />
