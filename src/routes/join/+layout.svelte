<script lang="ts">
	import { page } from '$app/stores';
	import AnimatedRoute from '$lib/components/AnimatedRoute.svelte';
	import { user } from '$lib/firebase';
</script>

<nav class="flex justify-center my-6">
	<ul class="steps">
		<a href="/join" class="step step-primary">Connect</a>
		{#if $user}
			<a href="/join/name" class="step" class:step-primary={$page.route.id?.match(/name|photo/g)}>
				Name
			</a>
			<a href="/join/photo" class="step" class:step-primary={$page.route.id?.includes('photo')}>
				Photo
			</a>
		{:else}
			<a
				href="/join"
				class="step step-neutral"
				class:step-primary={$page.route.id?.match(/name|photo/g)}
			>
				Name
			</a>
			<a
				href="/join"
				class="step step-neutral"
				class:step-primary={$page.route.id?.includes('photo')}
			>
				Photo
			</a>
		{/if}
	</ul>
</nav>

<AnimatedRoute>
	<main class="card w-4/6 bg-neutral text-neutral-content mx-auto">
		<div class="card-body items-center text-center">
			<slot />
		</div>
	</main>
</AnimatedRoute>
