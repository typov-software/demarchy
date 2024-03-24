<script lang="ts">
  import { navigating } from "$app/stores";
  export let loading: boolean = true;
</script>

<div class="loader" class:animate={$navigating || loading}>
  <svg
    width="36"
    height="36"
    viewBox="0 0 110 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="back absolute opacity-100"
  >
    <path
      d="M23 17H48.7771C56.2153 17 62.7237 18.382 68.3023 21.1459C73.9451 23.9099 78.3054 27.8584 81.3833 32.9915C84.4611 38.1245 86 44.1788 86 51.1545C86 62.6052 82.6657 71.2919 75.997 77.2146C69.3924 83.0716 60.3191 86 48.7771 86H23V17ZM50.3161 64.2832C58.652 64.2832 62.8199 59.907 62.8199 51.1545C62.8199 47.1402 61.7298 44.0801 59.5497 41.9742C57.3695 39.8025 54.2916 38.7167 50.3161 38.7167H45.7954V64.2832H50.3161Z"
      class="fill-secondary"
    />
  </svg>

  <svg
    width="36"
    height="36"
    viewBox="0 0 110 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="fore absolute mix-blend-lighten opacity-100"
  >
    <path
      d="M28 26H53.7771C61.2153 26 67.7237 27.3419 73.3023 30.0258C78.945 32.7096 83.3053 36.5436 86.3832 41.5279C89.4611 46.5122 91 52.391 91 59.1645C91 70.2833 87.6656 78.7182 80.9969 84.4692C74.3924 90.1564 65.3191 93 53.7771 93H28V26ZM55.316 71.9127C63.6519 71.9127 67.8198 67.6633 67.8198 59.1645C67.8198 55.2666 66.7298 52.2952 64.5496 50.2504C62.3695 48.1416 59.2916 47.0873 55.316 47.0873H50.7954V71.9127H55.316Z"
      class="fill-primary"
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
    transition: all;

    &.animate {
      .back {
        animation-name: load;
        animation-duration: 500ms;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
        animation-direction: alternate;
      }
      .fore {
        animation-name: load-fore;
        animation-duration: 500ms;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
        animation-direction: alternate;
      }
    }
  }

  @keyframes load {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(0px, 6px);
    }
  }
  @keyframes load-fore {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(-6px, 0px);
    }
  }
</style>
