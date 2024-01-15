<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  let name = '';
  let description = '';

  $: isValid = name.trim().length > 0;
  $: isTouched = name.length > 0;
</script>

<BasicSection>
  <h2 class="text-xl">New group</h2>
  <form method="post" class="max-w-md w-full">
    <input type="hidden" name="organization_id" value={data.organization.id} />
    <input type="hidden" name="profileName" value={data.profile.name} />
    <input type="hidden" name="profileHandle" value={data.profile.handle} />
    <div class="flex flex-col gap-4">
      <input
        type="text"
        id="name"
        name="name"
        autocomplete="off"
        class="input input-bordered"
        bind:value={name}
        placeholder="Name"
      />
      {#if isTouched && !isValid}
        <p class="text-error text-sm">Name can't be empty</p>
      {/if}
      <textarea
        class="textarea textarea-bordered"
        id="description"
        name="description"
        placeholder="Description"
        bind:value={description}
      />
      <button disabled={!isValid} type="submit" class="btn btn-success">Create</button>
    </div>
  </form>
</BasicSection>
