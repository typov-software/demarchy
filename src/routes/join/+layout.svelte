<script lang="ts">
	import { page } from '$app/stores';
	import AnimatedRoute from '$lib/components/AnimatedRoute.svelte';
	import { user } from '$lib/firebase';
</script>

<nav class="flex justify-center my-6">
	<ul class="steps">
		<a href="/join" class="step step-primary">Connect</a>
		<a
			href={$user ? '/join/handle' : '/join'}
			class="step"
			class:step-primary={$page.route.id?.match(/profile|handle/g)}
			class:step-neutral={$user === null}
		>
			Handle
		</a>
		<a
			href={$user ? '/join/profile' : '/join'}
			class="step"
			class:step-primary={$page.route.id?.match(/profile/g)}
			class:step-neutral={$user === null}
		>
			Profile
		</a>
	</ul>
</nav>

<AnimatedRoute>
	<main class="card w-4/6 bg-base-200 mx-auto">
		<div class="card-body items-center text-center">
			<slot />
		</div>
	</main>
</AnimatedRoute>
