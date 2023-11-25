<script lang="ts">
  import { page } from '$app/stores';
  import AnimatedRoute from '$lib/components/AnimatedRoute.svelte';
  import DemarchyLogo from '$lib/components/DemarchyLogo.svelte';
  import { user } from '$lib/firebase';
</script>

<main class="hero min-h-screen h-full">
  <div class="hero-content flex-col w-full min-h-full">
    <DemarchyLogo />

    <nav class="mb-6 mt-4">
      <ul class="steps steps-horizontal">
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
      <section class="card bg-base-200 w-96">
        <div class="card-body items-center text-center">
          <slot />
        </div>
      </section>
    </AnimatedRoute>

    <div class="flex-1" />
  </div>
</main>
