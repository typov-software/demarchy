<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import AuthProviders from '$lib/components/AuthProviders.svelte';
  import { auth, user } from '$lib/firebase';
  import { type AuthProvider } from '$lib/models/profiles';
  import { getProviders } from '$lib/utils/client-auth';
  import { signInWithPopup, signOut } from 'firebase/auth';

  const providers = getProviders();

  async function handleSignIn(pid: AuthProvider) {
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
  }

  async function endSession() {
    await fetch('/api/session', { method: 'DELETE' });
    await signOut(auth);
    await invalidateAll();
  }
</script>

{#if $user}
  <p class="pb-6 card-title text-center justify-center">Welcome to Demarchy</p>
  <p class="pb-6 text-center justify-center">Continue setting up your account</p>
{:else}
  <p class="pb-6">Connect with a provider</p>
{/if}

{#if $user}
  <div class="flex items-center justify-around gap-0 sm:gap-4">
    <button
      title="Logout"
      class="btn btn-sm btn-ghost text-neutral hover:text-base-content"
      on:click={endSession}
    >
      <span class="material-symbols-outlined -scale-100">logout</span>
      Logout
    </button>
    <a href="/join/handle" class="btn btn-success">
      Choose your handle
      <span class="material-symbols-outlined">navigate_next</span>
    </a>
  </div>
{:else}
  <div class="w-full flex flex-col gap-2 max-w-xs">
    <AuthProviders action="up" onChoose={handleSignIn} />
  </div>
{/if}
