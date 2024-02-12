<script lang="ts">
  import { enhance } from '$app/forms';
  import type { BallotTally } from '$lib/models/ballots';
  import type { Vote, VoteAction } from '$lib/models/votes';
  import { workingCallback } from '$lib/stores/working';
  import { titleCase } from '$lib/utils/string';

  export let contextPath: string;
  export let ballotPath: string;
  export let action: VoteAction;
  export let vote: null | Vote;
  export let tally: null | BallotTally;

  const symbols: Record<VoteAction, string> = {
    accept: 'thumb_up',
    reject: 'thumb_down',
    abstain: 'front_hand',
    block: 'crisis_alert'
  };
</script>

<form method="post" action="?/vote" use:enhance={workingCallback()} class="flex">
  <input type="hidden" name="path" value={ballotPath} />
  <input type="hidden" name="context_path" value={contextPath} />
  <input type="hidden" name="action" value={action} />
  <button
    class="btn w-full"
    class:btn-sm={action === 'abstain' || action === 'block'}
    class:btn-primary={action === 'accept'}
    class:btn-secondary={action === 'reject'}
    class:btn-neutral={action === 'abstain'}
    class:border-neutral={action === 'abstain'}
    class:btn-ghost={action === 'block' && vote?.action !== 'block'}
    class:text-neutral={action === 'block' && vote?.action !== 'block'}
    class:btn-outline={action !== 'block' && vote?.action !== action}
    class:btn-warning={action === 'block' && vote?.action === 'block'}
  >
    {vote ? (tally && tally[action]) || '' : ''}
    <span class="material-symbols-outlined">{symbols[action]}</span>
    {titleCase(action)}
  </button>
</form>
