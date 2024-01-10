<script lang="ts">
  import { docStore } from '$lib/firebase';
  import type { Group } from '$lib/models/groups';
  import type { Library } from '$lib/models/libraries';
  import type { Organization } from '$lib/models/organizations';
  import { getComparator, stableSort } from '$lib/utils/sorting';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let organization: Organization;
  export let group: Group;
  export let libraryId: string = 'latest';

  let library = docStore<Library>(
    `/organizations/${organization.id}/groups/${group.id}/libraries/${libraryId}`
  );

  $: docRefs = stableSort(Object.values($library?.docs ?? {}), getComparator('asc', 'name'));
</script>

<ul>
  {#each docRefs as ref (ref.id)}
    <li>
      <button on:click={() => dispatch('select', ref)} class="btn">
        <span class="material-symbols-outlined">article</span>
        {ref.name}
      </button>
    </li>
  {/each}
</ul>
