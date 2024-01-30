<script lang="ts">
  export let handle: string;
</script>

<a class="link link-success" title={`See @${handle}'s profile`} href={`/d/profiles/${handle}`}
  >@{handle}</a
>
