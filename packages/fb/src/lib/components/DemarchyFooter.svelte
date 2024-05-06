<script>
  import DemarchyLogo from "./DemarchyLogo.svelte";
  const version = __VERSION__;
</script>

<footer
  class="footer flex md:flex-row flex-col justify-around items-center py-4 md:py-8 text-neutral gap-0 relative z-1 mt-4"
>
  <aside class="flex flex-row items-center">
    <DemarchyLogo width={127} animate />
    <p class="text-sm ml-2 mt-1">
      <a
        href="https://github.com/typov-software/demarchy"
        target="_blank"
        rel="noopener noreferrer"
        class="link link-hover"
        title="Source code on Github"
      >
        {version}
      </a>
      <a
        href="https://typov.com"
        target="_blank"
        rel="noopener noreferrer"
        class="link link-hover"
        title="Facilitated by typov"
      >
        typov
      </a>
    </p>
  </aside>
  <nav class="flex flex-row flex-wrap items-center justify-center gap-x-2 gap-y-0 text-sm mt-1">
    <div>
      <a href="/terms" title="Terms" class="link-hover">Terms</a>
      <a href="/privacy" title="Privacy" class="link-hover">Privacy</a>
      <a href="/security" title="Security" class="link-hover">Security</a>
    </div>
    <div>
      <a href="/documentation" title="Documentation" class="link-hover">Documentation</a>
      <a href="/pricing" title="Pricing" class="link-hover">Pricing</a>
      <a href="/about" title="About" class="link-hover">About</a>
    </div>
  </nav>
</footer>

<style lang="scss">
  footer {
    border-top: 1px solid oklch(var(--b2));

    a:hover {
      @apply text-base-content;
      @apply transition-all;
    }
  }
</style>
