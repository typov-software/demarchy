<script lang="ts">
  import { auth, user } from '$lib/firebase';
  import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
  import { backIn } from 'svelte/easing';

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

<main class="hero min-h-screen">
  <div class="hero-content flex-col">
    <div class="max-w-lg text-center items-center flex-col">
      <a href="/" class="inline-block">
        <svg width="300" viewBox="0 0 127 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M49.4609 17.1131V7.09566H51.9653V4.59131H56.974V7.09566H59.4783V17.1131H56.974V12.1044H51.9653V17.1131H49.4609ZM51.9653 9.60001H56.974V7.19583H51.9653V9.60001Z"
            class="fill-primary"
          />
          <path
            d="M64.487 17.1131V4.59131H72.0001V7.09566H74.5044V9.60001H72.0001V14.6087H74.5044V17.1131H72.0001V14.6087H69.4957V12.1044H66.9914V17.1131H64.487ZM66.9914 9.60001H71.8999V7.09566H66.9914V9.60001Z"
            class="fill-primary"
          />
          <path
            d="M82.0175 7.09566V4.59131H87.0262V7.09566H82.0175ZM82.0175 17.1131V14.6087H79.5131V7.09566H82.0175V14.6087H87.0262V17.1131H82.0175ZM87.0262 14.6087V12.1044H89.5305V14.6087H87.0262Z"
            class="fill-primary"
          />
          <path
            d="M94.5392 17.1131V4.59131H97.0436V9.60001H102.052V4.59131H104.557V17.1131H102.052V12.1044H97.0436V17.1131H94.5392Z"
            class="fill-primary"
          />
          <path
            d="M114.574 17.1131V9.60001H112.07V7.09566H109.565V4.59131H112.07V7.09566H114.574V9.60001H117.078V17.1131H114.574ZM119.583 7.09566V4.59131H122.087V7.09566H119.583ZM117.078 9.60001V7.09566H119.583V9.60001H117.078Z"
            class="fill-primary"
          />
          <path
            d="M49.4609 19.6174V9.60001L51.9653 9.60001V7.09566H56.974V9.60001L59.4783 9.60001V19.6174H56.974V14.6087H51.9653V19.6174H49.4609ZM51.9653 12.1044H56.974V9.70018H51.9653V12.1044Z"
            class="fill-secondary"
          />
          <path
            d="M64.487 19.6174V7.09566H72.0001V9.60001H74.5044V12.1044H72.0001V17.1131H74.5044V19.6174H72.0001V17.1131H69.4957V14.6087H66.9914V19.6174H64.487ZM66.9914 12.1044L71.8999 12.1044V9.60001H66.9914V12.1044Z"
            class="fill-secondary"
          />
          <path
            d="M82.0175 9.60001V7.09566H87.0262V9.60001H82.0175ZM82.0175 19.6174V17.1131H79.5131V9.60001H82.0175V17.1131H87.0262V19.6174H82.0175ZM87.0262 17.1131V14.6087H89.5305V17.1131H87.0262Z"
            class="fill-secondary"
          />
          <path
            d="M94.5392 19.6174V7.09566H97.0436V12.1044H102.052V7.09566H104.557V19.6174H102.052V14.6087H97.0436V19.6174H94.5392Z"
            class="fill-secondary"
          />
          <path
            d="M114.574 19.6174V12.1044H112.07V9.60001L109.565 9.60001V7.09566H112.07V9.60001H114.574V12.1044H117.078V19.6174H114.574ZM119.583 9.60001V7.09566H122.087V9.60001L119.583 9.60001ZM117.078 12.1044V9.60001H119.583V12.1044H117.078Z"
            class="fill-secondary"
          />
          <path
            d="M4.38257 17.1131V4.59131H11.8956V7.09566H14.4V14.6087H11.8956V17.1131H4.38257ZM6.88692 14.6087H11.7954V7.09566H6.88692V14.6087Z"
            class="fill-secondary"
          />
          <path
            d="M19.4087 17.1131V4.59131H26.9217V7.09566H21.913V9.60001H26.9217V12.1044H21.913V14.6087H26.9217V17.1131H19.4087Z"
            class="fill-secondary"
          />
          <path
            d="M31.9304 17.1131V4.59131H34.4348V7.09566H36.9391V9.60001H39.4435V12.1044H36.9391V9.60001H34.4348V17.1131H31.9304ZM41.9478 17.1131V9.60001H39.4435V7.09566H41.9478V4.59131H44.4522V17.1131H41.9478Z"
            class="fill-secondary"
          />
          <path
            d="M4.38257 19.6174V7.09566H11.8956V9.60001H14.4V17.1131H11.8956V19.6174H4.38257ZM6.88692 17.1131H11.7954V9.60001H6.88692V17.1131Z"
            class="fill-primary"
          />
          <path
            d="M19.4087 19.6174V7.09566H26.9217V9.60001H21.913V12.1044H26.9217V14.6087H21.913V17.1131H26.9217V19.6174H19.4087Z"
            class="fill-primary"
          />
          <path
            d="M31.9304 19.6174V7.09566H34.4348V9.60001H36.9391V12.1044H39.4435V14.6087H36.9391V12.1044L34.4348 12.1044V19.6174H31.9304ZM41.9478 19.6174V12.1044L39.4435 12.1044V9.60001H41.9478V7.09566H44.4522V19.6174H41.9478Z"
            class="fill-primary"
          />
        </svg>
      </a>

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
            {#if $user}
              <a href="/d" class="btn btn-primary">Go to dashboard</a>
              <button class="btn btn-warning" on:click={endSession}>Sign out</button>
            {:else}
              <button class="btn btn-primary" on:click={signUpWithGoogle}>
                Sign in with Google
              </button>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
