<script lang="ts">
  import { doc, getDoc } from 'firebase/firestore';
  import type { PageData } from './$types';
  import { db } from '$lib/firebase';
  import { checkValidSlug, slugify } from '$lib/utils/string';
  import AuthCheck from '$lib/components/AuthCheck.svelte';
  import DemarchyLogo from '$lib/components/DemarchyLogo.svelte';

  export let data: PageData;

  let slug = '';
  let name = '';
  let voucher_id = '';

  let loading = false;
  let isAvailable = false;
  let debounceTimer: NodeJS.Timeout;

  $: isValidName = name.length > 2 && name.length <= 32;
  $: isValid = checkValidSlug(slug);
  $: isTouched = slug.length > 0;
  $: isTaken = isValid && !isAvailable && !loading;
  $: selectedVoucher = voucher_id.length > 0;
  $: canCreate = isValid && isValidName && isAvailable && selectedVoucher;

  $: {
    slug = slugify(name);
  }

  async function checkSlugAvailability() {
    isAvailable = false;
    clearTimeout(debounceTimer);

    loading = true;
    debounceTimer = setTimeout(async () => {
      const ref = doc(db, 'slugs', slug);
      const exists = await getDoc(ref).then((doc) => doc.exists());
      isAvailable = !exists;
      loading = false;
    }, 500);
  }
</script>

<AuthCheck>
  <section class="hero min-h-screen h-full">
    <div class="hero-content flex-col w-full min-h-full">
      <DemarchyLogo />

      <form method="POST" class="flex flex-col gap-4">
        <div>
          {#if !selectedVoucher}
            <label class="label" for="voucher_id">
              <span class="label-text">A voucher is required to created an Organization</span>
            </label>
          {:else}
            <label class="label" for="voucher_id">
              <span class="label-text">Selected voucher</span>
            </label>
          {/if}
          <select
            class="select select-bordered w-full"
            name="voucher_id"
            id="voucher_id"
            bind:value={voucher_id}
          >
            <option disabled selected value="">Choose an unused voucher</option>
            {#each data.vouchers as voucher}
              <option value={voucher.id} class="text-sm">
                {voucher.type}
                ({voucher.id})
              </option>
            {/each}
          </select>
        </div>

        <input
          disabled={!selectedVoucher}
          class="input input-bordered w-full"
          type="text"
          name="name"
          id="name"
          placeholder="Organization name"
          autocomplete="off"
          on:input={checkSlugAvailability}
          bind:value={name}
          class:input-error={!isValidName}
          class:input-success={isValidName}
        />
        {#if name.length && !isValidName}
          <p class="text-error text-sm">must be 3-32 characters long</p>
        {/if}

        <div>
          {#if name.length}
            <label for="slug" class="label">
              <span class="label-text">Suggested: {slugify(name)}</span>
            </label>
          {/if}
          <input
            disabled={!selectedVoucher}
            class="input input-bordered w-full"
            type="text"
            name="slug"
            id="slug"
            autocomplete="off"
            placeholder="Organization URL slug"
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

        {#if canCreate}
          <button class="btn btn-success">Create Organization</button>
        {/if}
      </form>
    </div>
  </section>
</AuthCheck>
