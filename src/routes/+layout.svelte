<script lang="ts">
  import { page } from '$app/stores';
  import DemarchyFooter from '$lib/components/DemarchyFooter.svelte';
  import { applyStoredTheme } from '$lib/stores/themes';
  import { afterUpdate } from 'svelte';
  import '../app.scss';

  if (typeof window !== 'undefined') {
    applyStoredTheme();
  }

  $: renderFooter = [
    '/',
    '/about',
    '/documentation',
    '/join',
    '/login',
    '/pricing',
    '/privacy',
    '/security',
    '/terms'
  ].includes($page.route.id ?? '');

  let cookieAckModal: HTMLDialogElement;

  function acknowledge() {
    cookieAckModal?.close();
    sessionStorage.setItem('cookie-ack', JSON.stringify({ ack: true, timestamp: Date.now() }));
  }

  afterUpdate(() => {
    if ($page.route.id !== '/privacy' && !sessionStorage.getItem('cookie-ack')) {
      cookieAckModal?.showModal();
    }
  });
</script>

<svelte:head>
  <title>Demarchy</title>
</svelte:head>

<slot />

{#if renderFooter}
  <DemarchyFooter />
{/if}

<dialog id="cookie-ack-modal" class="modal" bind:this={cookieAckModal}>
  <div class="modal-box">
    <h2 class="text-xl font-bold p2-4">Disclosure</h2>
    <p class="py-4">Demarchy uses a single cookie and saves simple preferences on your device.</p>
    <div class="flex gap-2">
      <a href="/privacy" class="btn btn-info" on:click={acknowledge}>See privacy policy</a>
      <button class="btn btn-success" on:click={acknowledge}>I consent</button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
