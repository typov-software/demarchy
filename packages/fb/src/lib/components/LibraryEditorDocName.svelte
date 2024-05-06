<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { DocSummary } from '$lib/models/libraries';
  import type { Amendment, Proposal } from '$lib/models/proposals';
  import { workingCallback } from '$lib/stores/working';

  export let doc: DocSummary & { displayName: string };
  export let amendment: Amendment | undefined = undefined;

  export let proposal: Proposal;

  let removeDialog: HTMLDialogElement;

  function handleLoadDoc() {
    $page.url.searchParams.set('doc_name', doc.name);
    $page.url.searchParams.set('doc_id', doc.id);
    goto(`?${$page.url.searchParams.toString()}`);
  }
</script>

<li class="flex flex-row">
  <button
    data-sveltekit-noscroll
    class="flex-1"
    class:active={$page.url.searchParams.get('doc') === doc.name}
    class:text-success={amendment?.type === 'create'}
    class:text-warning={amendment?.type === 'update'}
    class:text-error={amendment?.type === 'destroy'}
    on:click={handleLoadDoc}
  >
    <span class="material-symbols-outlined">article</span>
    {doc.displayName}
    {#if amendment}
      <span
        class="badge badge-xs"
        class:badge-success={amendment?.type === 'create'}
        class:badge-warning={amendment?.type === 'update'}
        class:badge-error={amendment?.type === 'destroy'}
      >
        {#if amendment?.type === 'create'}
          +
        {:else if amendment.type === 'update'}
          ~
        {:else if amendment.type === 'destroy'}
          -
        {/if}
      </span>
    {/if}
  </button>
  <div class="dropdown dropdown-end sm:dropdown-start px-0">
    <div tabindex="0" role="button" class="px-2">
      <span class="material-symbols-outlined text-base text-neutral">more_horiz</span>
    </div>
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <ul
      tabindex="0"
      class="menu menu-sm dropdown-content z-[1] bg-base-300 rounded-box shadow w-56"
    >
      <li>
        <form
          id={`${doc.id}-destroy-doc`}
          class="hidden"
          method="post"
          action="?/destroyDoc"
          use:enhance={workingCallback({ invalidateAll: true })}
        >
          <input type="hidden" name="proposal_path" value={proposal.path} />
          <input type="hidden" name="doc_path" value={doc.path} />
        </form>
        <button form={`${doc.id}-destroy-doc`} class="text-error">Destroy Doc</button>
      </li>
      {#if amendment}
        <li>
          <button class="bg-error" on:click={() => removeDialog.show()}>Remove amendment</button>
        </li>
      {/if}
    </ul>
  </div>
</li>

{#if amendment}
  <dialog bind:this={removeDialog} id={`${amendment.doc.id}-remove-amendment`} class="modal fixed">
    <div class="modal-box">
      <p class="text-wrap">
        Are you sure you want to remove <strong>{amendment.doc.name}</strong>? You can't undo this.
      </p>
      <div class="flex flex-row justify-end gap-2">
        <form method="dialog">
          <button class="btn">Cancel</button>
        </form>
        <form
          method="post"
          action="?/removeAmendment"
          use:enhance={workingCallback({
            reset: false,
            invalidateAll: true,
          })}
        >
          <input type="hidden" name="path" value={proposal.path} />
          <input type="hidden" name="doc_name" value={amendment.doc.name} />
          <button class="btn btn-error">Remove</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
{/if}
