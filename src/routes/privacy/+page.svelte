<script lang="ts">
  import { goto } from '$app/navigation';
  import { afterUpdate } from 'svelte';

  $: showAck = false;

  afterUpdate(() => {
    if (!sessionStorage.getItem('cookie-ack')) {
      showAck = true;
    }
  });

  function acknowledge() {
    sessionStorage.setItem('cookie-ack', JSON.stringify({ ack: true, timestamp: Date.now() }));
    goto('/');
  }
</script>

<div class="hero min-h-screen">
  <div class="hero-content w-full text-center">
    <div class="max-w-2xl flex flex-col">
      <h1 class="text-5xl font-bold pt-8">Privacy</h1>
      <small class="block py-2">Updated January 15, 2024</small>
      <div class="max-w-sm self-center my-4">
        <p class="py-2">This document describes how Demarchy stores and manages your data.</p>
      </div>

      <div class="text-left">
        <h2 id="analytics" class="text-2xl font-bold py-2 mt-4">Analytics</h2>
        <p class="py-2">
          Demarchy does <strong>not</strong> collect analytics and therefore cannot share analytics data
          with third parties.
        </p>

        <h2 id="cookies" class="text-2xl font-bold py-2 mt-4">Cookies</h2>
        <p class="py-2">
          Demarchy uses <strong>HTTP cookies</strong> only when necessary to the core user experience.
        </p>
        <blockquote class="mt-2" cite="https://en.wikipedia.org/wiki/HTTP_cookie">
          <p class="bg-base-200 rounded-md p-4">
            HTTP cookies (also called web cookies, Internet cookies, browser cookies, or simply
            cookies) are small blocks of data created by a web server while a user is browsing a
            website and placed on the user's computer or other device by the user's web browser.
          </p>
          <footer class="text-right text-xs">
            &mdash;Wikipedia, <cite
              ><a
                href="https://en.wikipedia.org/wiki/HTTP_cookie"
                class="link link-info link-hover"
                target="_blank"
                rel="noopener noreferrer"
              >
                HTTP cookie
                <span class="material-symbols-outlined text-sm"> open_in_new </span>
              </a>
            </cite>
          </footer>
        </blockquote>

        <h3 class="text-lg font-bold py-2 mt-4">
          <code>__session</code>
        </h3>
        <p class="py-2">
          The <code>__session</code> cookie is used by Demarchy servers to keep users authenticated throughout
          the duration of their visit and expires after 5 days.
        </p>

        <h2 id="storage" class="text-2xl font-bold py-2 mt-6">Web Storage</h2>
        <p class="py-2">
          Demarchy uses the <strong>Web Storage API</strong> to save simple preferences and manage session
          privacy notices.
        </p>
        <blockquote class="mt-2" cite="https://en.wikipedia.org/wiki/Web_storage">
          <p class="bg-base-200 rounded-md p-4">
            Web storage, sometimes known as DOM storage (Document Object Model storage), is a
            standard JavaScript API provided by web browsers. It enables websites to store
            persistent data on users' devices similar to cookies, but with much larger capacity and
            no information sent in HTTP headers.
          </p>
          <footer class="text-right text-xs">
            &mdash;Wikipedia, <cite
              ><a
                href="https://en.wikipedia.org/wiki/Web_storage"
                class="link link-info link-hover"
                target="_blank"
                rel="noopener noreferrer"
              >
                Web storage
                <span class="material-symbols-outlined text-sm"> open_in_new </span>
              </a>
            </cite>
          </footer>
        </blockquote>

        <h3 class="text-lg font-bold py-2 mt-4">
          <code>cookie-ack</code>
        </h3>
        <p class="py-2">
          The <code>cookie-ack</code> value saved in session storage persists your acknowledgement of
          Demarchy's privacy notice every session per GDPR in Europe and CCPA in California.
        </p>

        <h3 class="text-lg font-bold py-2 mt-4">
          <code>theme</code>
        </h3>
        <p class="py-2">
          The <code>theme</code> value saved in local storage persists your color theme preference on
          your device.
        </p>
      </div>

      <div class="divider mt-8" />

      <div class="max-w-lg self-center mt-2 mb-4">
        <p class="py-2">
          Demarchy is committed to transparency and ethical software design. Share your experience
          with <a href="mailto:support@typov.com" class="link link-info">support</a>.
        </p>
        {#if showAck}
          <p class="py-2 mt-4">
            <button class="btn btn-success" on:click={acknowledge}>I consent to this policy</button>
          </p>
        {/if}
      </div>
    </div>
  </div>
</div>
