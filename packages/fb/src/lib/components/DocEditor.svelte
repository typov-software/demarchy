<script lang="ts">
  import type { Doc, DocProps } from "$lib/models/docs";
  import type { Block } from "$lib/models/blocks";
  import { doc as fdoc, serverTimestamp, updateDoc } from "firebase/firestore";
  import { db, docStore } from "$lib/firebase";
  import { format } from "date-fns";
  import BlocksEditor from "$lib/components/BlocksEditor.svelte";
  import ProfileLink from "$lib/components/ProfileLink.svelte";
  import { fly } from "svelte/transition";
  import { expoOut } from "svelte/easing";
  import { createEventDispatcher } from "svelte";

  export let path: string;
  export let editable = true;
  export let showDetails = false;

  const dispatch = createEventDispatcher();

  let doc = docStore<Doc>(path);
  $: doc;

  let docName = $doc?.name;
  $: docName;

  let nameInput: HTMLInputElement;
  $: nameInput;

  async function saveBlocks(blocks: Block[]) {
    let nextBlocks = blocks.slice();
    if (!nextBlocks.length) {
      nextBlocks = [{ uid: crypto.randomUUID(), content: "", type: "text" }];
    }
    const docProps: Partial<DocProps> = { blocks: nextBlocks };
    await updateDoc(fdoc(db, path), {
      ...docProps,
      updated_at: serverTimestamp()
    });
  }
</script>

{#if $doc}
  <div class="flex flex-col w-full p-0 gap-2">
    <div class="bg-base-200 rounded-box">
      <button
        class="w-full flex flex-row justify-between items-center p-4"
        on:click={() => dispatch("details", !showDetails)}
      >
        <span>
          {$doc.name}
        </span>
        <span class="material-symbols-outlined transition-transform" class:rotate-180={showDetails}
          >expand_more</span
        >
      </button>
      {#if showDetails}
        <div
          class="flex-col p-4 pt-0 text-sm"
          in:fly={{ y: -10, delay: 0, duration: 500, easing: expoOut }}
        >
          <p>
            <span class="text-neutral">Identifier</span>
            {$doc.id}
          </p>
          {#if $doc.updated_at}
            <p>
              <span class="text-neutral"> Updated </span>
              {format($doc.updated_at, "MMMM d, yyyy p")}
            </p>
          {/if}
          {#if $doc.created_at}
            <p>
              <span class="text-neutral"> Created </span>
              {format($doc.created_at, "MMMM d, yyyy p")}
            </p>
          {/if}
          <p>
            <span class="text-neutral">Created by</span>
            <ProfileLink handle={$doc.profile_handle} />
          </p>
          <p class="flex flex-row flex-wrap gap-2">
            <span class="text-neutral">Contributors</span>
            {#each $doc.contributors as contributor (contributor)}
              <ProfileLink handle={contributor} />
            {/each}
          </p>
        </div>
      {/if}
    </div>

    <div
      class="flex flex-col w-full bg-base-200 rounded-box py-4 border-2"
      class:border-base-200={!editable}
      class:border-base-300={editable}
    >
      <BlocksEditor {saveBlocks} {editable} blocks={$doc?.blocks.slice() ?? []} />
    </div>
  </div>
{/if}

<style lang="scss">
</style>
