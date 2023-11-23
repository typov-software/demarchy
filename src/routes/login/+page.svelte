<script lang="ts">
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
  }

  async function endSession() {
    const res = await fetch('/api/session', { method: 'DELETE' });
    await signOut(auth);
  }
</script>

<h2>Login to Demarchy</h2>

{#if $user}
  <h2 class="card-title">Welcome, {$user.displayName}</h2>
  <p class="text-center text-success">You are signed in</p>
  <div>
    <button class="btn btn-warning" on:click={endSession}>Sign out</button>
    <a href="/d" class="btn btn-primary">Go to dashboard</a>
  </div>
{:else}
  <button class="btn btn-primary" on:click={signUpWithGoogle}>Sign in with Google</button>
{/if}
