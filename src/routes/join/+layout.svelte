<script lang="ts">
  import { page } from '$app/stores';
  import DemarchyLogo from '$lib/components/DemarchyLogo.svelte';
  import { user } from '$lib/firebase';
</script>

<main class="hero min-h-screen h-full">
  <div class="hero-content flex-col w-full min-h-full">
    <DemarchyLogo />

    <nav class="flex mt-4 justify-center w-full max-w-md">
      <ul class="steps steps-horizontal w-full">
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

    <div class="card bg-base-200 max-w-lg w-full mt-6">
      <div class="card-body items-center text-center">
        <slot />
      </div>
    </div>
  </div>
</main>
