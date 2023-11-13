<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import PageView from '$lib/components/PageView.svelte';
  import { auth, user } from '$lib/firebase';
  import { SUPPORTED_PROVIDER_IDS, type AuthProvider } from '$lib/models/profiles';
  import { titleCase } from '$lib/utils/string';
  import {
    GithubAuthProvider,
    GoogleAuthProvider,
    OAuthProvider,
    signInWithPopup,
    signOut
  } from 'firebase/auth';

  const providers: Record<AuthProvider, any> = {
    'google.com': new GoogleAuthProvider(),
    'github.com': new GithubAuthProvider(),
    'microsoft.com': new OAuthProvider('microsoft.com'),
    'apple.com': new OAuthProvider('apple.com')
  };

  function handleSignIn(pid: AuthProvider) {
    return async () => {
      const provider = providers[pid];
      const credential = await signInWithPopup(auth, provider);
      const idToken = await credential.user.getIdToken();
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken })
      });
      const body = await res.json();
      if (body.status === 'started') {
        await invalidateAll();
        await goto('/join/handle');
      }
    };
  }

  async function endSession() {
    const res = await fetch('/api/session', { method: 'DELETE' });
    await signOut(auth);
    await invalidateAll();
  }
</script>

<div class="flex-col items-center">
  {#if $user}
    <p class="pb-6">
      Welcome, {$user.displayName}!
      <span role="img" title="Hi">👋</span>
    </p>
  {:else}
    <p class="pb-6">Connect with a provider</p>
  {/if}

  {#if $user}
    <button class="btn btn-warning" on:click={endSession}>Sign out</button>
    <a href="/join/handle" class="btn btn-primary">Next</a>
  {:else}
    <div class="flex flex-col w-full gap-y-2">
      {#each SUPPORTED_PROVIDER_IDS as pid}
        <button class="btn btn-primary {pid}" on:click={handleSignIn(pid)}>
          Sign up with {titleCase(pid.split('.')[0])}
        </button>
      {/each}
    </div>
  {/if}
</div>

<PageView />
