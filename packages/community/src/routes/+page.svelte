<script lang="ts">
  import { onMount } from "svelte";
  import { expoInOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  import DemarchyLogo from "$lib/components/DemarchyLogo.svelte";
  import HomepageHero from "$lib/components/HomepageHero.svelte";
  import HeroCanvas from "$lib/components/HeroCanvas.svelte";
  import { theme, toggleTheme } from "$lib/stores/themes";

  const easing = expoInOut;

  let showDescription = false;
  onMount(() => {
    showDescription = true;
  });
</script>

<HeroCanvas />

<div class="hero w-full min-h-screen py-2 relative">
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
        A <strong class="d-anim-text-walk">democratic</strong> toolkit for communities and cooperatives
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
      <small
        class="text-neutral text-xs sm:text-sm"
        transition:fly={{ delay: 1000, duration: 1000, y: 20, easing }}>Early adopter access</small
      >
    {/if}
  </div>
  <button class="below-the-fold absolute bottom-10"
    ><span class="material-symbols-outlined text-accent text-6xl">arrow_drop_down</span></button
  >
</div>

<HomepageHero title="Organize" subtitle="Unite people around shared goals and values">
  <!-- the problem -->
  <p>
    A workplace, a social group, a fandom — whatever brings us together deserves flexible tools to
    support and sustain it.
  </p>
  <!-- demarchy solution -->
  <p>
    Demarchy is a new but familiar toolkit built for finding <strong class="d-anim-text-walk"
      >Unity</strong
    > within communities.
  </p>
  <!-- setup next -->
  <p>
    Biased towards transparency, ambitious supermajorities, and no space for intolerance — some
    values can't be compromised.
  </p>
</HomepageHero>

<HomepageHero reverse title="Listen" subtitle="Accept feedback to find opportunity for progress">
  <!-- the problem -->
  <p>Healthy communities start by listening to the needs of it's individuals.</p>
  <!-- demarchy solution -->
  <p>
    With Demarchy's <strong class="d-anim-text-walk">Feedback</strong> tool, groups can uplift comments
    and concerns in a place for all to see.
  </p>
  <!-- setup next -->
  <p>Use comments as a spark for change to make progress towards goals.</p>
</HomepageHero>

<HomepageHero
  title="Discuss"
  subtitle="Focus ideas and conversations to shape policy and take action"
>
  <!-- the problem -->
  <p>
    Modern chatrooms and collaborative document editors fail to keep discussions productive with all
    stakeholders involved.
  </p>
  <!-- demarchy solution -->
  <p>
    Dive into the details with Demarchy <strong class="d-anim-text-walk">Discussions</strong> and lead
    conversations to transparent, meaningful outcomes.
  </p>
  <!-- setup next -->
  <p>
    Keep members informed by pinning action items and conflict resolutions from comments to the top
    of discussions.
  </p>
</HomepageHero>

<HomepageHero reverse title="Propose" subtitle="Reconcile ideas and materials">
  <!-- the problem -->
  <p>Live editing documents shared by many peers is traditionally a risky endeavor.</p>
  <!-- demarchy solution -->
  <p>
    <strong class="d-anim-text-walk">Proposals</strong> in Demarchy collect changes to libraries before
    updates are approved &mdash; creating time and space for consensus.
  </p>
  <!-- setup next -->
  <p>
    Members of a community should have a say in how they operate without steep hierarchies to climb.
  </p>
</HomepageHero>

<HomepageHero title="Together" subtitle="Seek clarity and consensus with tools for resolution">
  <!-- the problem -->
  <p>Many decisions that affect our communities are made by an elite few out of sight.</p>
  <!-- demarchy solution -->
  <p>
    In Demarchy, any member of an organization can form <strong class="d-anim-text-walk"
      >Groups</strong
    >
    that own their docs and settings for all to see.
  </p>
  <!-- setup next -->
  <p>
    Besides comment moderation, all roles in Demarchy are equal &mdash; you'll find no
    "administrators" here.
  </p>
</HomepageHero>

<HomepageHero reverse title="Vote" subtitle="Aim high with configurable supermajorities">
  <!-- the problem -->
  <p>
    Today's leaders proudly defend democratic ideals &mdash; until its time to make consequential
    decisions.
  </p>
  <!-- demarchy solution -->
  <p>
    Demarchy <strong class="d-anim-text-walk">Ballots</strong> makes voting simple, fast, and automatic.
  </p>
  <!-- setup next (CTA) -->
  <p>
    Bring horizontal decision making to your community and trust people to make changes on their own
    behalf.
  </p>
</HomepageHero>

<div class="flex flex-col items-center pb-28 gap-8 z-1 relative">
  <p class="text-xl">Sign up for <strong class="d-anim-text-walk">early</strong> access</p>
  <a href="/join" class="btn btn-secondary sm:btn-lg" title="Join now">
    <span class="material-symbols-outlined">join</span>
    Join now
  </a>
</div>

<label
  for="theme-toggle"
  class="theme-toggle flex flex-row items-center rounded-none absolute top-2 right-2 z-10 gap-1 opacity-50 cursor-pointer"
>
  <span class="material-symbols-outlined text-sm">light_mode</span>
  <input
    id="theme-toggle"
    type="checkbox"
    class="toggle toggle-xs"
    checked={$theme === "dark"}
    on:change={toggleTheme}
  />
  <span class="material-symbols-outlined text-sm">dark_mode</span>
</label>

<style lang="scss">
  .below-the-fold {
    opacity: 0;
    animation-name: below-the-fold;
    animation-iteration-count: infinite;
    animation-delay: 2000ms;
    animation-duration: 2000ms;
    animation-timing-function: ease-in-out;
  }

  @keyframes below-the-fold {
    0% {
      opacity: 1;
      transform: translateY(-25px);
    }

    50% {
      opacity: 0;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
    }
  }
</style>
