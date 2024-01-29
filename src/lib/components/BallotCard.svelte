<script lang="ts">
  import { enhance } from '$app/forms';
  import { docStore } from '$lib/firebase';
  import { type Ballot, type BallotTally } from '$lib/models/ballots';
  import type { Vote } from '$lib/models/votes';
  import { workingCallback } from '$lib/stores/working';
  import VoteButton from './VoteButton.svelte';

  export let ballot: Ballot;
  export let contextPath: string;
  export let voterId: string;
  export let ownsContext: boolean;

  let adoptModal: HTMLDialogElement;

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
    {#if ownsContext}
      {#if ballot.context === 'proposals'}
        <button class="btn btn-lg btn-success" on:click={() => adoptModal.showModal()}
          >Commit accepted changes</button
        >
      {/if}
    {/if}
  </div>
</div>

<dialog id="adopt-proposal" class="modal" bind:this={adoptModal}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">Warning</h3>
    <p class="py-4">Are you sure you want to adopt this proposal?</p>

    <div class="flex justify-end gap-2">
      <button class="btn btn-secondary" on:click={() => adoptModal.close()}>No</button>
      <form
        method="post"
        action="?/adoptProposal"
        use:enhance={workingCallback({
          onStart() {
            adoptModal?.close();
          },
          reset: true
        })}
      >
        <input type="hidden" name="path" value={contextPath} />
        <input type="hidden" name="organization_id" value={ballot.organization_id} />
        <input type="hidden" name="ballot_id" value={ballot.id} />
        <button class="btn btn-primary">I'm sure, immediately adopt this</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
