<script lang="ts">
  import { goto } from '$app/navigation';
  import DemarchyLogo from '$lib/components/DemarchyLogo.svelte';
  import PageView from '$lib/components/PageView.svelte';
  import { auth, db, profile, user } from '$lib/firebase';
  import { SUPPORTED_PROVIDER_IDS, type AuthProvider } from '$lib/models/profiles';
  import { titleCase } from '$lib/utils/string';
  import {
    GithubAuthProvider,
    GoogleAuthProvider,
    OAuthProvider,
    signInWithPopup,
    signOut
  } from 'firebase/auth';
  import { doc, getDoc } from 'firebase/firestore';

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
      const profileExists = (await getDoc(doc(db, `profiles/${credential.user.uid}`))).exists();
      if (!profileExists) {
        await goto('/join/handle');
      } else {
        await goto('/d');
      }
    };
  }

  async function endSession() {
    const res = await fetch('/api/session', { method: 'DELETE' });
    await signOut(auth);
  }
</script>

<main class="hero min-h-screen">
  <div class="hero-content flex-col">
    <div class="max-w-lg text-center items-center flex flex-col">
      <DemarchyLogo width={300} />

      <div class="flex-col items-center">
        {#if $user}
          <p class="py-6">
            Welcome back, {$user.displayName}!
            <span role="img" title="Hi">👋</span>
          </p>
        {:else}
          <p class="py-6">Sign in using an existing provider</p>
        {/if}

        <div class="card">
          <div class="card-body bg-base-200">
            {#if $user && $profile}
              <a href="/d" class="btn btn-primary">Go to dashboard</a>
              <button class="btn btn-warning" on:click={endSession}>Sign out</button>
            {:else if $user && !$profile}
              <a href="/join/handle" class="btn btn-primary">Finish signing up</a>
            {:else}
              {#each SUPPORTED_PROVIDER_IDS as pid}
                <button class="btn btn-primary {pid}" on:click={handleSignIn(pid)}>
                  Sign in with {titleCase(pid.split('.')[0])}
                </button>
              {/each}
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<PageView />
