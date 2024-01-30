<script lang="ts">
  import BasicSection from '$lib/components/BasicSection.svelte';
  import { checkValidSlug, slugify } from '$lib/utils/string';
  import { doc, getDoc } from 'firebase/firestore';
  import type { PageData } from './$types';
  import { db } from '$lib/firebase';
  import { enhance } from '$app/forms';
  import { workingCallback } from '$lib/stores/working';

  export let data: PageData;

  let slug = '';
  let name = '';
  let description = '';

  let loading = false;
  let isAvailable = false;
  let debounceTimer: NodeJS.Timeout;

  $: isValidName = name.length > 2 && name.length <= 32;
  $: isValid = checkValidSlug(slug);
  $: isTouched = slug.length > 0;
  $: isTaken = isValid && !isAvailable && !loading;
  $: canCreate = isValid && isValidName && isAvailable;

  $: {
    slug = slugify(name);
  }

  async function checkSlugAvailability() {
    isAvailable = false;
    clearTimeout(debounceTimer);

    loading = true;
    debounceTimer = setTimeout(async () => {
      const ref = doc(db, `/organizations/${data.organization.id}/slugs`, slug);
      const exists = await getDoc(ref).then((doc) => doc.exists());
      isAvailable = !exists;
      loading = false;
    }, 500);
  }
</script>

<BasicSection>
  <h2 class="text-xl">New group</h2>
  <form method="post" class="max-w-md w-full" use:enhance={workingCallback()}>
    <input type="hidden" name="organization_id" value={data.organization.id} />
    <input type="hidden" name="profile_name" value={data.profile.name} />
    <input type="hidden" name="profile_handle" value={data.profile.handle} />
    <div class="flex flex-col gap-4">
      <input
        id="name"
        type="text"
        name="name"
        placeholder="Name"
        autocomplete="off"
        on:input={checkSlugAvailability}
        bind:value={name}
        class="input input-bordered"
        class:input-error={!isValidName}
        class:input-success={isValidName}
      />
      {#if isTouched && !isValidName}
        <p class="text-error text-sm">must be 3-32 characters long</p>
      {/if}

      <div>
        {#if isTouched}
          <label for="slug" class="label">
            <span class="label-text">Suggested: {slugify(name)}</span>
          </label>
        {/if}
        <input
          class="input input-bordered w-full"
          type="text"
          name="slug"
          id="slug"
          autocomplete="off"
          placeholder="Group URL slug"
          bind:value={slug}
          on:input={checkSlugAvailability}
          class:input-error={!isValid && isTouched}
          class:input-warning={isTaken}
          class:input-success={isAvailable && isValid && !loading}
        />

        {#if loading}
          <p class="text-secondary text-sm">Checking availability of {slug}...</p>
        {/if}

        {#if !isValid && isTouched}
          <p class="text-error text-sm">must be 3-32 characters long, alphanumeric only</p>
        {/if}

        {#if isValid && !isAvailable && !loading}
          <p class="text-warning text-sm">
            {slug} is not available
          </p>
        {/if}
      </div>
      <textarea
        class="textarea textarea-bordered"
        id="description"
        name="description"
        placeholder="Description"
        bind:value={description}
      />
      {#if canCreate}
        <button disabled={!isValid} type="submit" class="btn btn-success">Create Group</button>
      {/if}
    </div>
  </form>
</BasicSection>
