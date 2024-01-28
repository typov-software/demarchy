<script lang="ts">
  import type { Doc, DocProps } from '$lib/models/docs';
  import { fade } from 'svelte/transition';
  import type { Block } from '$lib/models/blocks';
  import { doc as fdoc, serverTimestamp, updateDoc } from 'firebase/firestore';
  import { db, docStore } from '$lib/firebase';
  import { format } from 'date-fns';
  import BlocksEditor from '$lib/components/BlocksEditor.svelte';
  import ProfileLink from '$lib/components/ProfileLink.svelte';

  export let path: string;
  export let editable = true;

  let doc = docStore<Doc>(path);

  let docName = $doc?.name;
  $: docName;

  let nameInput: HTMLInputElement;
  $: nameInput;

  $: blocks = $doc?.blocks.slice() ?? [];

  async function saveBlocks(blocks: Block[]) {
    let nextBlocks = blocks.slice();
    if (!nextBlocks.length) {
      nextBlocks = [{ uid: crypto.randomUUID(), content: '', type: 'text' }];
    }
    const docProps: Partial<DocProps> = { blocks: nextBlocks };
    await updateDoc(fdoc(db, path), {
      ...docProps,
      updated_at: serverTimestamp()
    });
  }
</script>

{#if $doc}
  <div class="w-full p-0" in:fade={{ duration: 200 }}>
    <div class="flex items-center text-xs px-4 py-2 mb-2 bg-base-300 gap-2">
      Created by <ProfileLink handle={$doc.profile_handle} />
      on {format($doc.created_at, 'MMMM d, yyyy')}
    </div>
    <BlocksEditor {saveBlocks} {editable} {blocks} />
  </div>
{/if}
