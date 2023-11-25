<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  function handleLink(pid: string) {
    return () => {
      //
    };
  }
</script>

<section class="flex flex-col items-center py-6 gap-8">
  <div class="flex flex-col w-full max-w-lg">
    <h2 class="font-bold">Connected Providers</h2>
    <ul class="w-full mt-4">
      {#each data.connected as provider}
        <li class="card bg-base-200">
          <div class="card-body">
            <div class="flex items-center">
              {provider.providerId}
              ({provider.email})
            </div>
          </div>
        </li>
      {/each}
    </ul>
  </div>

  <div class="flex flex-col max-w-lg w-full">
    <h2 class="font-bold">Available Providers</h2>
    <p class="text-xs">Connecting providers increases your login options</p>
    <ul class="w-full mt-4">
      {#each data.disconnected as provider}
        <li class="card bg-base-200">
          <div class="card-body">
            <div class="flex items-center">
              <p>
                {provider}
              </p>
              <button on:click={handleLink(provider)} class="btn btn-primary">Link</button>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  </div>
</section>
