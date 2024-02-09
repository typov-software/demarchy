<script lang="ts">
  import { SUPPORTED_PROVIDER_IDS, type AuthProvider } from '$lib/models/profiles';
  import { titleCase } from '$lib/utils/string';
  import AuthIcons from './AuthIcons.svelte';

  export let action: 'in' | 'up';
  export let onChoose: (pid: AuthProvider) => void;
</script>

{#each SUPPORTED_PROVIDER_IDS as pid}
  <button class="btn bg-base-100 font-noto {pid} w-auto" on:click={() => onChoose(pid)}>
    <AuthIcons {pid} />
    Sign {action} with {titleCase(pid.split('.')[0])}
  </button>
{/each}
