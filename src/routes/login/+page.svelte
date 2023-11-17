<script lang="ts">
	import { auth, user } from '$lib/firebase';
	import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

	async function signUpWithGoogle() {
		const provider = new GoogleAuthProvider();
		const user = await signInWithPopup(auth, provider);
	}
</script>

<h2>Login to Demarchy</h2>

{#if $user}
	<h2 class="card-title">Welcome, {$user.displayName}</h2>
	<p class="text-center text-success">You are signed in</p>
	<button class="btn btn-warning" on:click={() => signOut(auth)}>Sign out</button>
{:else}
	<button class="btn btn-primary" on:click={signUpWithGoogle}>Sign in with Google</button>
{/if}
