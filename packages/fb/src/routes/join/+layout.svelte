<script lang="ts">
  import { page } from '$app/stores';
  import DemarchyLogo from '$lib/components/DemarchyLogo.svelte';
  import { joinVoucher, user } from '$lib/firebase';
  import HeroCanvas from '../HeroCanvas.svelte';

  let fallbackHref = '/join';
  $: fallbackHref;
  $: {
    if (!$user && !$joinVoucher?.redeemed) {
      fallbackHref = '/join';
    } else if ($user && !$joinVoucher?.redeemed) {
      fallbackHref = '/join/voucher';
    }
  }
</script>

<HeroCanvas />

<main class="hero min-h-screen h-full">
  <div class="hero-content flex-col justify-start sm:justify-center w-full min-h-full">
    <DemarchyLogo />

    <nav class="flex mt-4 justify-center w-full max-w-md">
      <ul class="steps steps-horizontal w-full">
        <a href="/join" class="step step-primary">Connect</a>
        <a
          href={$user ? '/join/voucher' : fallbackHref}
          class="step"
          class:step-primary={$page.route.id?.match(/profile|handle|voucher/g)}
          class:step-neutral={$user === null}
        >
          Voucher
        </a>
        <a
          href={$user && $joinVoucher?.redeemed ? '/join/handle' : fallbackHref}
          class="step"
          class:step-primary={$page.route.id?.match(/profile|handle/g)}
          class:step-neutral={$user === null || !$joinVoucher?.redeemed}
        >
          Handle
        </a>
        <a
          href={$user && $joinVoucher?.redeemed ? '/join/profile' : fallbackHref}
          class="step"
          class:step-primary={$page.route.id?.match(/profile/g)}
          class:step-neutral={$user === null || !$joinVoucher?.redeemed}
        >
          Profile
        </a>
      </ul>
    </nav>

    <div class="card bg-base-200 max-w-lg w-full mt-6">
      <div class="card-body items-center text-center p-4 sm:p-8">
        <slot />
      </div>
    </div>
  </div>
</main>
