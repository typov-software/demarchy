<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { organizeLibrary, type LibraryShelf } from '$lib/models/libraries';
  import { format } from 'date-fns';
  import type { PageData } from '../docs/$types';
  import DocViewer from './DocViewer.svelte';
  import LibraryViewerDirectory from '$lib/components/LibraryViewerDirectory.svelte';

  export let data: PageData;

  let shelf: LibraryShelf;
  $: shelf = data.library
    ? organizeLibrary(data.library)
    : { library_id: 'latest', rows: new Map([]), dirs: {} };
  $: console.log(shelf);
</script>

<BasicSection otherClass="!items-start">
  <div class="flex flex-row w-full items-center">
    <Breadcrumbs organization={data.organization} groups={data.allowed_groups} group={data.group} />
    <div class="flex flex-1" />
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-sm btn-square btn-primary">
        <span class="material-symbols-outlined">more_vert</span>
      </div>
      <div class="dropdown-content z-[1] shadow bg-base-300 rounded-box">
        <ul class="menu w-60">
          <li>
            <a href="?">
              <span class="material-symbols-outlined">add</span>
              TODO
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div class="flex flex-col sm:flex-row w-full gap-4">
    <div class="flex flex-col">
      <div class="dropdown dropdown-bottom mb-2">
        <div tabindex="0" role="button" class="btn btn-sm w-full">
          {data.library?.id ?? ''}
        </div>
        <ul class="menu w-60 dropdown-content z-[1] shadow bg-base-300 rounded-box">
          {#each data.versions as library (library.id)}
            <li>
              <a href={`?library=${library.id}`}>
                {library.id}
                {format(library.created_at, 'yyyy/MM/dd p')}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <LibraryViewerDirectory dir="" {shelf} />
    </div>

    <div class="sm:flex-1">
      {#if data.doc}
        <DocViewer doc={data.doc} />
      {:else}
        <p
          class="text-center sm:text-left text-sm text-neutral flex items-center justify-center sm:justify-start gap-2 mt-1.5 w-full"
        >
          Choose a Version
        </p>
        <p
          class="text-center sm:text-left text-sm text-neutral flex items-center justify-center sm:justify-start gap-2 mt-[1.75rem] w-full"
        >
          And a Doc
        </p>
      {/if}
    </div>
  </div>
</BasicSection>
