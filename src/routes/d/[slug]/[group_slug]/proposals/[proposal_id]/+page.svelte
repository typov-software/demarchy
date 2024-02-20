<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import type { PageData } from './$types';
  import BallotCard from '$lib/components/BallotCard.svelte';
  import LibraryEditor from '$lib/components/LibraryEditor.svelte';
  import { enhance } from '$app/forms';
  import { workingCallback } from '$lib/stores/working';
  import { autosize } from '$lib/stores/use-autosize';
  import { doc } from 'firebase/firestore';
  import { db, docStore } from '$lib/firebase';
  import type { Reaction, ReactionTally } from '$lib/models/reactions';
  import ReactionSelector from '$lib/components/ReactionSelector.svelte';
  import SeenCounter from '$lib/components/SeenCounter.svelte';

  export let data: PageData;

  $: editable = data.profile.id === data.proposal.user_id && data.proposal.state === 'draft';
  $: isOpen = data.proposal.state === 'open';

  let reactionPath = `${data.proposal.path}/reactions/${data.profile.id}`;
  let reactionRef = doc(db, reactionPath);
  let tallyRef = doc(db, `${data.proposal.path}/tallies/reactions`);

  let reactionDoc = docStore<Reaction>(reactionRef.path);
  $: reaction = $reactionDoc;

  let tallyDoc = docStore<ReactionTally>(tallyRef.path);
  $: tally = $tallyDoc;

  let title = data.proposal.title;
  let description = data.proposal.description;

  $: title, description;
  $: hasChanges = title !== data.proposal.title || description !== data.proposal.description;
</script>

{#key data.proposal.id}
  <BasicSection>
    <Breadcrumbs organization={data.organization} groups={data.allowed_groups} group={data.group} />

    <div class="w-full flex flex-col gap-4">
      <div class="w-full flex flex-col-reverse sm:flex-row gap-4">
        {#if data.ballot}
          <div class="sm:max-w-72">
            <BallotCard
              ballot={data.ballot}
              contextPath={data.proposal.path}
              group={data.group}
              ownsContext={data.proposal.user_id === data.profile.id}
              proposalSettings={data.settings.proposals}
              voterId={data.profile.id}
            />
          </div>
        {/if}

        <div class="flex flex-col flex-1 gap-4">
          <div class="card bg-base-200">
            <div class="card-body p-6 pb-4">
              <form
                id="update-proposal"
                method="post"
                action="?/updateProposal"
                use:enhance={workingCallback({
                  reset: false,
                  invalidateAll: true
                })}
              >
                <input type="hidden" name="path" value={data.proposal.path} />
                <div class="card-title flex flex-row gap-4 items-center mb-2">
                  {#if data.proposal.state === 'adopted'}
                    <mark class="badge badge-lg badge-accent">Adopted</mark>
                  {/if}
                  <input
                    disabled={!editable}
                    class="input w-full bg-base-200 focus:bg-base-100 px-2 py-1 min-h-0 h-auto disabled:text-base-content disabled:cursor-text"
                    type="text"
                    name="title"
                    placeholder="Title"
                    bind:value={title}
                  />
                  {#if isOpen && tally}
                    <SeenCounter
                      context="proposals"
                      contextId={data.proposal.id}
                      {reaction}
                      {reactionPath}
                      {tally}
                    />
                  {/if}
                </div>
                <textarea
                  bind:value={description}
                  use:autosize
                  disabled={!editable}
                  class="textarea w-full bg-base-200 focus:bg-base-100 px-2 py-1 disabled:text-base-content disabled:cursor-text"
                  name="description"
                  placeholder="Describe the intentions and changes of this proposal"
                  rows={1}
                />
              </form>

              <div class="card-actions justify-end">
                {#if editable}
                  <div class="dropdown dropdown-end">
                    <div role="button" tabindex="0" class="btn btn-sm btn-ghost">
                      <span class="material-symbols-outlined">present_to_all</span>
                      Open Proposal
                    </div>
                    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                    <div
                      tabindex="0"
                      class="dropdown-content p-4 z-[1] bg-base-300 rounded-box shadow w-72"
                    >
                      <form
                        method="post"
                        action="?/openProposal"
                        use:enhance={workingCallback({
                          invalidateAll: true
                        })}
                        class="flex flex-col gap-2"
                      >
                        <input type="hidden" name="path" value={data.proposal.path} />
                        <input type="hidden" name="organization_id" value={data.organization.id} />
                        <input type="hidden" name="group_id" value={data.group.id} />
                        <p>Are you sure you want to submit your proposal for review?</p>
                        <p class="text-sm">You won't be able to revert this to a draft.</p>
                        <button class="btn btn-primary btn-sm mt-2" title="Open Proposal">
                          <span class="material-symbols-outlined">present_to_all</span>
                          Open Proposal
                        </button>
                      </form>
                    </div>
                  </div>
                  {#if hasChanges}
                    <button form="update-proposal" class="btn btn-success btn-sm"
                      >Save Changes</button
                    >
                  {/if}
                {/if}
                {#if isOpen && tally && reaction}
                  <ReactionSelector {reaction} {tally} />
                {/if}
              </div>
            </div>
          </div>

          {#each Object.values(data.proposal.amendments) as amendment (amendment.doc.id)}
            <details class="collapse collapse-arrow bg-base-200">
              <summary class="collapse-title">
                <mark
                  class="badge"
                  class:bg-success={amendment.type === 'create'}
                  class:bg-warning={amendment.type === 'update'}
                  class:bg-error={amendment.type === 'destroy'}
                >
                  {amendment.type}
                </mark>
                <span>
                  {amendment.doc.name}
                </span>
              </summary>
              <div class="collapse-content">
                <p>TODO: amendment diff</p>
              </div>
            </details>
          {/each}
        </div>
      </div>

      {#if data.library}
        <LibraryEditor
          organization={data.organization}
          group={data.group}
          proposal={data.proposal}
          profile={data.profile}
          library={data.library}
        />
      {/if}
    </div>
  </BasicSection>
{/key}
