<script lang="ts">
  import { page } from '$app/stores';
  import BasicSection from '$lib/components/BasicSection.svelte';
  $: subroute = $page.url.pathname.split('/').at(-1);
  $: console.log({ subroute });
</script>

<BasicSection otherClass="w-full items-stretch">
  <div class="flex flex-col md:max-w-4xl md:self-center gap-4 w-full">
    <h2 class="text-xl">Your Settings</h2>

    <div class="flex flex-col sm:flex-row gap-4 w-full">
      <ul class="menu bg-base-200 rounded-box w-full h-auto sm:max-w-56 self-start">
        <li>
          <a href="/d/settings" class:active={subroute === 'settings'}>Overview</a>
        </li>
        <li />
        <li>
          <a href="/d/settings/account" class:active={subroute === 'account'}>Account</a>
        </li>
        <li>
          <a href="/d/settings/billing" class:active={subroute === 'billing'}>Billing</a>
        </li>
        <li>
          <a href="/unsubscribe">Emails</a>
        </li>
      </ul>

      <div class="flex flex-col w-full h-full items-start justify-start">
        <slot />
      </div>
    </div>
  </div>
</BasicSection>
