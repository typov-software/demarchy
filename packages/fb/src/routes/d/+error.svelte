<script lang="ts">
  import { page } from '$app/stores';
</script>

<main class="hero">
  <div class="hero-content flex-col">
    <h2 class="text-lg font-bold">Something isn't right</h2>
    <p class="py-8">{$page.status}: {$page.error?.message}</p>
    <a class="btn" href="/d">
      <span class="material-symbols-outlined">arrow_back</span>
      Back to your dashboard
    </a>
    <small class="flex items-center gap-2">
      Contact <a class="link" href="mailto:support@typov.com">support</a> or
      <a
        class="link"
        href="https://github.com/typov-software/demarchy/issues"
        target="_blank"
        rel="noreferrer noopener">file an issue</a
      >
    </small>
  </div>
</main>
