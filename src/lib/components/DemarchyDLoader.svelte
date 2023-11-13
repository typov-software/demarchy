<script lang="ts">
  import { navigating } from '$app/stores';
  export let loading: boolean;
</script>

<div class="loader" class:animate={$navigating || loading}>
  <svg
    width="36"
    height="36"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="back absolute"
  >
    <path d="M26 80V20H62V32H74V68H62V80H26ZM38 68H61.52V32H38V68Z" class="fill-secondary" />
  </svg>
  <svg
    width="36"
    height="36"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="fore absolute"
  >
    <path d="M26 80V20H62V32H74V68H62V80H26ZM38 68H61.52V32H38V68Z" class="fill-primary" />
  </svg>
</div>

<style lang="scss">
  .loader {
    width: 36px;
    height: 36px;
    position: relative;
    z-index: -1;

    .back {
      transform: translate(0, -2px);
    }

    .fore {
      transform: translate(0, 2px);
    }

    &.animate {
      .back {
        animation-name: load;
        animation-duration: 500ms;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
        animation-direction: alternate;
      }
      .fore {
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
      transform: translate(0, -2px);
    }
    100% {
      transform: translate(0, 2px);
    }
  }
</style>
