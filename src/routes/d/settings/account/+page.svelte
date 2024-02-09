<script lang="ts">
  import type { AuthProvider } from '$lib/models/profiles';
  import { OAuthProvider, linkWithPopup, unlink } from 'firebase/auth';
  import type { PageData } from './$types';
  import { user } from '$lib/firebase';
  import { invalidateAll } from '$app/navigation';
  import { getProviders } from '$lib/utils/client-auth';
  import AuthIcons from '$lib/components/AuthIcons.svelte';

  export let data: PageData;

  const providers = getProviders();

  function handleLink(pid: AuthProvider) {
    const provider = providers[pid];
    return async () => {
      try {
        const result = await linkWithPopup($user!, provider);
        const credential = OAuthProvider.credentialFromResult(result);
        if (credential && result.user.uid === $user!.uid) {
          // successfully linked, reload page data
          await invalidateAll();
        } else {
          console.error('unexpected state');
        }
      } catch (error: unknown) {
        console.error(error);
      }
    };
  }

  function handleUnlink(pid: AuthProvider) {
    return async () => {
      try {
        await unlink($user!, pid);
        // successfully unlinked, reload page data
        await invalidateAll();
      } catch (error: unknown) {
        console.error(error);
      }
    };
  }
</script>

<div class="flex flex-col gap-8">
  <div class="flex flex-col w-full">
    <h3 class="text-lg font-bold my-3">Connected Providers</h3>
    <p>Manage your linked providers</p>
    <ul class="w-full mt-4 flex flex-col gap-4">
      {#each data.connected as provider (provider.providerId)}
        <li class="card bg-base-200">
          <div class="card-body p-4">
            <div class="flex flex-wrap items-center gap-2">
              <AuthIcons pid={provider.providerId} />
              <p>
                {provider.providerId}
                <span class="text-neutral">
                  ({provider.email})
                </span>
              </p>
              {#if data.connected.length > 1}
                <button
                  on:click={handleUnlink(provider.providerId)}
                  class="btn btn-sm btn-secondary"
                >
                  Unlink
                </button>
              {/if}
            </div>
          </div>
        </li>
      {/each}
    </ul>
  </div>

  {#if data.disconnected.length > 0}
    <div class="flex flex-col w-full">
      <h3 class="text-lg font-bold my-3">Available Providers</h3>
      <p>Link third party providers to increase your login options</p>
      <ul class="w-full mt-4 flex flex-col gap-4">
        {#each data.disconnected as pid (pid)}
          <li class="card bg-base-200">
            <div class="card-body p-4">
              <div class="flex flex-wrap items-center gap-2">
                <AuthIcons {pid} />
                <p>
                  {pid}
                </p>
                <button on:click={handleLink(pid)} class="btn btn-sm btn-primary">Link</button>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
