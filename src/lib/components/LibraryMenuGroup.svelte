<script lang="ts">
  import _get from 'lodash/get';
  import type { DocSummary, LibraryDirectory, LibraryShelf } from '$lib/models/libraries';
  import { getComparator, stableSort } from '$lib/utils/sorting';

  export let dir: string;
  export let shelf: LibraryShelf;

  let dirs: LibraryDirectory;
  let docs: (DocSummary & { displayName: string })[];

  $: dirs = dir === '' ? { ...shelf.dirs } : _get(shelf.dirs, dir.replaceAll('/', '.')) ?? {};
  $: dirnames = Object.keys(dirs).sort();
  $: docs = stableSort(
    (shelf.docs.get(dir) ?? []).map((d) => ({ ...d, displayName: d.name.split('/').pop()! })),
    getComparator('asc', 'displayName')
  );
</script>

{#if dir === ''}
  <ul class="menu menu-sm w-full sm:w-auto sm:min-w-56 bg-base-200 rounded-box">
    {#each dirnames as dirname (dirname)}
      <li>
        <svelte:self dir={dirname} {shelf} />
      </li>
    {/each}

    {#each docs as doc (doc.id)}
      <li>
        <a href={`?library=${shelf.library_id}&doc=${doc.id}`}>
          <span class="material-symbols-outlined">article</span>
          {doc.displayName}
        </a>
      </li>
    {/each}
  </ul>
{:else}
  <details>
    <summary>
      <span class="material-symbols-outlined">folder</span>
      {dir.split('/').pop()}
    </summary>

    <ul>
      {#each dirnames as dirname (`${dir}/${dirname}`)}
        <li>
          <svelte:self dir={`${dir}/${dirname}`} {shelf} />
        </li>
      {/each}

      {#each docs as doc (doc.id)}
        <li>
          <a href={`?library=${shelf.library_id}&doc=${doc.id}`}>
            <span class="material-symbols-outlined">article</span>
            {doc.displayName}
          </a>
        </li>
      {/each}
    </ul>
  </details>
{/if}
