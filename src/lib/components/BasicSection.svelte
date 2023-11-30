<script lang="ts">
  export let otherClass = '';
</script>

<section class="flex flex-col items-center py-6 px-4 gap-8 {otherClass}">
  <slot />
</section>
