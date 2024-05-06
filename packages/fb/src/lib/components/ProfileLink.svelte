<script lang="ts">
  export let handle: string;
</script>

<a class="link text-purple-500" title={`See @${handle}'s profile`} href={`/d/profiles/${handle}`}
  >@{handle}</a
>
