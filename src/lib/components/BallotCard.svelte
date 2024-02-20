<script lang="ts">
  import { enhance } from '$app/forms';
  import { docStore } from '$lib/firebase';
  import { type Ballot, type BallotTally } from '$lib/models/ballots';
  import type { Group } from '$lib/models/groups';
  import type { ProposalSettings } from '$lib/models/settings';
  import type { Vote } from '$lib/models/votes';
  import { workingCallback } from '$lib/stores/working';
  import VoteButton from './VoteButton.svelte';

  export let ballot: Ballot;
  export let proposalSettings: ProposalSettings;
  export let group: Group;
  export let contextPath: string;
  export let voterId: string;
  export let ownsContext: boolean;

  let adoptModal: HTMLDialogElement;

  let tally = docStore<BallotTally>(`${contextPath}/tallies/consensus`);
  let vote = docStore<Vote>(`${ballot.path}/votes/${voterId}`);

  $: acceptedRatio = $tally?.accept ? ($tally.accept / group.member_count) * 100 : 0;
  $: rejectedRatio = $tally?.reject ? ($tally.reject / group.member_count) * 100 : 0;
  $: abstainedRatio = $tally?.abstain ? ($tally.abstain / group.member_count) * 100 : 0;
  $: blockedRatio = $tally?.block ? ($tally.block / group.member_count) * 100 : 0;

  $: canAdopt =
    $tally?.accept &&
    $tally.accept > 0 &&
    $tally.accept / group.member_count >= proposalSettings.acceptance_threshold_ratio;
</script>

<div class="card bg-base-200 w-full">
  <div class="card-body">
    {#if ballot.context === 'proposals'}
      <div class="card-title">Ballot</div>
      <p class="">Should we accept these amendments to our library?</p>
    {/if}
    <p>{ballot.description}</p>
    {#if $vote}
      <div class="w-full h-3 flex bg-base-300 rounded-box overflow-hidden mb-4">
        <div
          class="w-full h-full bg-warning transition-all"
          style:max-width={`${blockedRatio}%`}
          title={`Blocked by ${blockedRatio}%`}
        />
        <div
          class="w-full h-full bg-neutral transition-all"
          style:max-width={`${abstainedRatio}%`}
          title={`Abstained by ${abstainedRatio}%`}
        />
        <div
          class="w-full h-full bg-secondary transition-all"
          style:max-width={`${rejectedRatio}%`}
          title={`Rejected by ${rejectedRatio}%`}
        />
        <div
          class="w-full h-full bg-primary transition-all"
          style:max-width={`${acceptedRatio}%`}
          title={`Accepted by ${acceptedRatio}%`}
        />
      </div>
    {/if}
    <div class="card-actions flex-col items-stretch">
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
    {#if ownsContext && canAdopt}
      {#if ballot.context === 'proposals'}
        <div class="flex justify-center mt-5">
          <button
            class="btn btn-lg rounded-full btn-success"
            on:click={() => adoptModal.showModal()}>Adopt amendments</button
          >
        </div>
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
          reset: true,
          invalidateAll: true
        })}
      >
        <input type="hidden" name="path" value={contextPath} />
        <input type="hidden" name="organization_id" value={ballot.organization_id} />
        <input type="hidden" name="group_id" value={ballot.group_id} />
        <input type="hidden" name="ballot_id" value={ballot.id} />
        <button class="btn btn-primary">I'm sure, immediately adopt this</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
