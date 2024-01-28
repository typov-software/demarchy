<script lang="ts">
  import { navigating } from '$app/stores';
  export let loading: boolean = true;
</script>

<div class="loader" class:animate={$navigating || loading}>
  <svg
    width="36"
    height="36"
    viewBox="0 0 115 115"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="back absolute"
  >
    <path
      class="fill-secondary"
      d="M23.5659 20.4346H49.8542C57.4399 20.4346 64.0774 21.8078 69.7666 24.5544C75.5213 27.3009 79.9681 31.2246 83.107 36.3253C86.2459 41.426 87.8153 47.4422 87.8153 54.374C87.8153 65.7525 84.4149 74.3845 77.6139 80.2699C70.8783 86.09 61.6251 89 49.8542 89H23.5659V20.4346ZM51.4237 67.42C59.9249 67.42 64.1755 63.0713 64.1755 54.374C64.1755 50.3849 63.0638 47.3441 60.8404 45.2515C58.617 43.0935 55.4781 42.0145 51.4237 42.0145H46.8134V67.42H51.4237Z"
    />
  </svg>
  <svg
    width="36"
    height="36"
    viewBox="0 0 115 115"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="fore absolute"
  >
    <path
      class="fill-primary"
      d="M29.5005 28.9849H55.2285C62.6525 28.9849 69.1485 30.3289 74.7165 33.0169C80.3485 35.7049 84.7005 39.5449 87.7725 44.5369C90.8445 49.5289 92.3805 55.4169 92.3805 62.2009C92.3805 73.3369 89.0525 81.7849 82.3965 87.5449C75.8045 93.2409 66.7485 96.0889 55.2285 96.0889H29.5005V28.9849ZM56.7645 74.9689C65.0845 74.9689 69.2445 70.7129 69.2445 62.2009C69.2445 58.2969 68.1565 55.3209 65.9805 53.2729C63.8045 51.1609 60.7325 50.1049 56.7645 50.1049H52.2525V74.9689H56.7645Z"
    />
  </svg>
</div>

<style lang="scss">
  .loader {
    width: 36px;
    height: 36px;
    position: relative;
    z-index: -1;
    transform: translate(0, 0);

    &.animate {
      .back {
        animation-name: load;
        animation-duration: 500ms;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
        animation-direction: alternate;
      }
      .fore {
        mix-blend-mode: lighten;
        animation-name: load;
        animation-duration: 500ms;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
        animation-direction: alternate-reverse;
      }
    }
  }

  @keyframes load {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(3px, 3px);
      opacity: 0.7;
    }
  }
</style>
