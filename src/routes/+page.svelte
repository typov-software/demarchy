<script lang="ts">
  import { onMount } from 'svelte';
  import { expoInOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import DemarchyLogo from '$lib/components/DemarchyLogo.svelte';
  import HomepageHero from './HomepageHero.svelte';
  import HeroCanvas from './HeroCanvas.svelte';

  const easing = expoInOut;

  let showDescription = false;
  onMount(() => {
    showDescription = true;
    console.log('DEMARCHY is proudly built without AI generated code.');
  });
</script>

<HeroCanvas />

<div class="hero w-full min-h-screen py-2">
  <div class="hero-content flex-col w-full">
    {#if showDescription}
      <h1
        title="Demarchy"
        class="w-full max-w-2xl"
        transition:fly={{ delay: 0, duration: 500, opacity: 0, easing }}
      >
        <DemarchyLogo animate width="100%" />
      </h1>
      <p
        class="py-6 w-full text-center text-base sm:text-xl"
        transition:fly={{ delay: 200, duration: 1000, y: 60, easing }}
      >
        A <strong class="demarchy-faded-walk">democratic</strong> toolkit for communities
      </p>
      <div
        class="flex flex-row gap-4 justify-center mt-2"
        transition:fly={{ delay: 400, duration: 1000, y: 20, easing }}
      >
        <a
          href="/join"
          class="btn btn-secondary sm:btn-lg"
          transition:fly={{ delay: 1000, x: -20, opacity: 1, easing }}
        >
          <span class="material-symbols-outlined">join</span>
          Join now
        </a>
        <a
          href="/login"
          class="btn btn-primary sm:btn-lg"
          transition:fly={{ delay: 1000, x: 20, opacity: 1, easing }}
        >
          <span class="material-symbols-outlined">login</span>
          Login
        </a>
      </div>
    {/if}
  </div>
</div>

<HomepageHero reverse title="Organize" subtitle="Unite people around shared goals and values">
  <p>
    A workplace, a social group, a fandom — whatever brings us together deserves flexible tools to
    support and sustain it.
  </p>
  <p>
    Demarchy is a new but familiar toolkit built for finding <strong class="demarchy-faded-walk"
      >Unity</strong
    > within communities.
  </p>
  <p>
    Biased towards transparency, ambitious super majorities, and no tolerance for intolerance — some
    values can't be compromised.
  </p>
</HomepageHero>

<HomepageHero title="Listen" subtitle="Accept feedback to find opportunity for progress">
  <p>Healthy communities start by listening to the needs of it's individuals.</p>
  <p>
    With Demarchy's <strong class="demarchy-faded-walk">Feedback</strong> tool, groups can uplift comments
    and concerns in a place for all to see.
  </p>
  <p>Use comments as a spark for change to make progress towards goals.</p>
</HomepageHero>

<HomepageHero
  reverse
  title="Discuss"
  subtitle="Focus ideas and conversations to shape policy and take action"
>
  <p>TODO</p>
</HomepageHero>

<HomepageHero title="Propose" subtitle="Craft proposals that update group libraries and settings">
  <p>TODO</p>
</HomepageHero>

<HomepageHero
  reverse
  title="Together"
  subtitle="Seek understanding and consensus from the group with tools to resolve questions and concerns"
>
  <p>TODO</p>
</HomepageHero>

<HomepageHero title="Vote" subtitle="Take action for the changes you believe in">
  <p>TODO</p>
</HomepageHero>

<div class="flex flex-col items-center pb-28 gap-8 z-1 relative">
  <p class="text-lg">Sign up for early access</p>
  <a href="/join" class="btn btn-secondary sm:btn-lg">
    <span class="material-symbols-outlined">join</span>
    Join now
  </a>
</div>
