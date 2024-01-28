<script lang="ts">
  import { docStore } from '$lib/firebase';
  import { type Ballot, type BallotTally } from '$lib/models/ballots';
  import type { Vote } from '$lib/models/votes';
  import VoteButton from './VoteButton.svelte';

  export let ballot: Ballot;
  export let contextPath: string;
  export let voterId: string;

  let tally = docStore<BallotTally>(`${contextPath}/tallies/consensus`);
  let vote = docStore<Vote>(`${ballot.path}/votes/${voterId}`);
</script>

<div class="card bg-base-200 w-full">
  <div class="card-body p-8">
    {#if ballot.context === 'proposals'}
      <div class="card-title text-center items-center justify-center">
        Should we accept these amendments to our library?
      </div>
    {/if}
    <p>{ballot.description}</p>

    <div class="card-actions flex-col sm:flex-row-reverse items-stretch sm:justify-center">
      <VoteButton
        action="accept"
        {contextPath}
        ballotPath={ballot.path}
        vote={$vote}
        tally={$tally}
      />
      <VoteButton
        action="reject"
        {contextPath}
        ballotPath={ballot.path}
        vote={$vote}
        tally={$tally}
      />
      <VoteButton
        action="abstain"
        {contextPath}
        ballotPath={ballot.path}
        vote={$vote}
        tally={$tally}
      />
      <VoteButton
        action="block"
        {contextPath}
        ballotPath={ballot.path}
        vote={$vote}
        tally={$tally}
      />
    </div>
  </div>
</div>
