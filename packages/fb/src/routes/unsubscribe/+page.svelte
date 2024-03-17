<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import DemarchyLogo from '$lib/components/DemarchyLogo.svelte';
  import { emptyString } from '$lib/utils/string';
  import HeroCanvas from '../HeroCanvas.svelte';

  let email = $page.url.searchParams.get('email') ?? '';
  let list = $page.url.searchParams.get('list') ?? '';

  $: email, list;

  $: unsubscribed = false;
  $: unsubscribing = false;
  $: canSubmit = !emptyString(email) && !emptyString(list);
</script>

<HeroCanvas />

<div class="hero min-h-screen">
  <div class="hero-content flex-col gap-6">
    <DemarchyLogo width="100%" />
    {#if unsubscribed}
      <p>You've successfully unsubscribed</p>
      <a href="/d" title="Dashboard" class="btn btn-success">Dashboard</a>
    {:else}
      <p>Unsubscribe from email lists</p>
      <form
        method="post"
        action="?/unsubscribe"
        class="w-full flex flex-col gap-4"
        use:enhance={() => {
          unsubscribing = true;
          return ({ update }) => {
            unsubscribing = false;
            unsubscribed = true;
            update({ reset: true });
          };
        }}
      >
        <div class="flex flex-col gap-2">
          <label for="list" class="text-sm text-neutral">Mailing List</label>
          <select
            disabled={unsubscribing}
            bind:value={list}
            id="list"
            name="list"
            class="select select-bordered"
          >
            <option value="">Choose list</option>
            <option value="devlog">Devlog</option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <label for="email" class="text-sm text-neutral">Email</label>
          <input
            disabled={unsubscribing}
            bind:value={email}
            type="email"
            name="email"
            placeholder="Email"
            class="input input-bordered"
          />
        </div>
        <button disabled={!canSubmit} class="btn btn-secondary mt-2">Unsubscribe</button>
      </form>
    {/if}
  </div>
</div>
