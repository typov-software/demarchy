<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth, user } from '$lib/firebase';
  import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

  async function signUpWithGoogle() {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    const idToken = await credential.user.getIdToken();
    const res = await fetch('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idToken })
    });
    const status = (await res.json()).status === 'started';
    if (status) {
      goto('/join/handle');
    }
  }

  async function endSession() {
    const res = await fetch('/api/session', { method: 'DELETE' });
    await signOut(auth);
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
    <button class="btn btn-primary" on:click={signUpWithGoogle}> Sign up with Google </button>
  {/if}
</div>
