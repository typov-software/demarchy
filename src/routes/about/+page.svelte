<script lang="ts">
  import { user } from '$lib/firebase';
  import HeroCanvas from '../HeroCanvas.svelte';
</script>

<HeroCanvas />

<div class="hero min-h-screen">
  <div class="hero-content">
    <div class="flex flex-col max-w-xl gap-4 text-justify">
      <h1 class="text-5xl font-bold font-prompt mb-4">About</h1>
      <p>
        Demarchy is a new but familiar toolkit built for finding <strong class="d-anim-text-walk"
          >Unity</strong
        > within communities and cooperatives.
      </p>
      <p>
        At its core is a document library that groups manage democratically through <strong
          >discussions</strong
        >
        and <strong>proposals</strong>.
      </p>
      <p>
        Before libraries can be updated, proposals must be reviewed and <strong>voted</strong> on by
        group members.
      </p>
      <p>
        Once proposals are accepted, authors may commit the proposal changes to a new <strong
          >version</strong
        > of the library.
      </p>
      <p>
        A mix of elected and randomly selected <strong>moderators</strong> keep discussions in line with
        the group's values.
      </p>
      <div class="mt-4">
        {#if $user}
          <a href="/d" title="Your Dashboard" class="btn btn-primary">Go to dashboard</a>
        {:else}
          <a href="/join" title="Join" class="btn btn-secondary">
            <span class="material-symbols-outlined">join</span>
            Join now
          </a>
        {/if}
      </div>
    </div>
  </div>
</div>
