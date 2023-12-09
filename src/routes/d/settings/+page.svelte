<script lang="ts">
  import PageView from '$lib/components/PageView.svelte';
  import {
    GithubAuthProvider,
    GoogleAuthProvider,
    OAuthProvider,
    linkWithPopup,
    unlink
  } from 'firebase/auth';
  import type { PageData } from './$types';
  import { user } from '$lib/firebase';
  import type { AuthProvider } from '$lib/models/profiles';
  import { invalidateAll } from '$app/navigation';
  import BasicSection from '$lib/components/BasicSection.svelte';

  export let data: PageData;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providers: Record<AuthProvider, any> = {
    'google.com': new GoogleAuthProvider(),
    'github.com': new GithubAuthProvider(),
    'microsoft.com': new OAuthProvider('microsoft.com'),
    'apple.com': new OAuthProvider('apple.com')
  };

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

<BasicSection>
  <h1 class="max-w-lg w-full text-xl font-semibold">Account Settings</h1>
  <div class="flex flex-col w-full max-w-lg">
    <h2 class="font-bold">Connected Providers</h2>
    <p class="text-xs">Manage your linked providers</p>
    <ul class="w-full mt-4">
      {#each data.connected as provider}
        <li class="card bg-base-200">
          <div class="card-body">
            <div class="flex items-center">
              <p>
                {provider.providerId}
                ({provider.email})
              </p>
              {#if provider.providerId !== 'google.com' && data.connected.length > 1}
                <button on:click={handleUnlink(provider.providerId)} class="btn btn-accent">
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
    <div class="flex flex-col max-w-lg w-full">
      <h2 class="font-bold">Available Providers</h2>
      <p class="text-xs">Link third party providers to increase your login options</p>
      <ul class="w-full mt-4">
        {#each data.disconnected as provider}
          <li class="card bg-base-200">
            <div class="card-body">
              <div class="flex items-center">
                <p>
                  {provider}
                </p>
                <button on:click={handleLink(provider)} class="btn btn-primary">Link</button>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</BasicSection>

<div class="flex-1" />
<PageView />
