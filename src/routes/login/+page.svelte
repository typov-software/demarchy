<script lang="ts">
  import { goto } from '$app/navigation';
  import AuthProviders from '$lib/components/AuthProviders.svelte';
  import BasicSection from '$lib/components/BasicSection.svelte';
  import DemarchyLogo from '$lib/components/DemarchyLogo.svelte';
  import { auth, db, profile, user } from '$lib/firebase';
  import { type AuthProvider } from '$lib/models/profiles';
  import { getProviders } from '$lib/utils/client-auth';
  import { signInWithPopup, signOut } from 'firebase/auth';
  import { doc, getDoc } from 'firebase/firestore';

  const providers = getProviders();

  async function handleSignIn(pid: AuthProvider) {
    const provider = providers[pid];
    const credential = await signInWithPopup(auth, provider);
    const idToken = await credential.user.getIdToken();
    await fetch('/api/session', {
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
  }

  async function endSession() {
    await fetch('/api/session', { method: 'DELETE' });
    await signOut(auth);
  }
</script>

<BasicSection otherClass="min-h-full h-full">
  <div class="flex flex-col justify-center items-center w-full h-full min-h-full">
    <DemarchyLogo width={300} />

    <div class="flex flex-col items-center w-full">
      {#if $user}
        <p class="py-6">
          Welcome back, {$profile?.name}!
        </p>
      {:else}
        <p class="py-6">Sign in using an existing provider</p>
      {/if}

      {#if $user && $profile}
        <div class="flex items-center gap-4">
          <button
            title="Sign out"
            class="btn btn-ghost text-neutral hover:text-base-content"
            on:click={endSession}
          >
            <span class="material-symbols-outlined -scale-100">logout</span>
            Sign out
          </button>
          <a href="/d" class="btn btn-primary" title="Go to dashboard">
            <span class="material-symbols-outlined">exit_to_app</span>
            Go to dashboard</a
          >
        </div>
      {:else if $user && !$profile}
        <a href="/join/handle" class="btn btn-primary">Finish signing up</a>
      {:else}
        <div class="card w-full max-w-sm">
          <div class="card-body bg-base-200 rounded-box">
            <AuthProviders action="in" onChoose={handleSignIn} />
          </div>
        </div>
      {/if}
    </div>
  </div>
</BasicSection>
