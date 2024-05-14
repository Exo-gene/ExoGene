<script>
  // No script is necessary unless adding interactivity
</script>

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(10, 10, 10, 0.86); /* Dark semi-transparent background */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .spinner {
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .circle-background,
  .circle-progress {
    fill: none;
    stroke-width: 10;
    cx: 50;
    cy: 50;
    r: 45;
  }

  .circle-background {
    stroke: rgba(255, 255, 255, 0.2);
  }

  .circle-progress {
    stroke: #3498db;
    stroke-linecap: round;
    transform-origin: center;
    transform: rotate(-90deg);
    animation: progress-animation 2s infinite ease-in-out;
  }

  .spinner-text {
    font-size: 1.5rem;
    fill: #fff;
    animation: text-animation 2s infinite;
  }

  @keyframes progress-animation {
    0% {
      stroke-dasharray: 0, 283;
    }
    50% {
      stroke-dasharray: 141.5, 283;
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dasharray: 0, 283;
      stroke-dashoffset: -283;
    }
  }

  @keyframes text-animation {
    0%,
    100% {
      fill: #fff;
    }
    50% {
      fill: #3498db;
    }
  }
</style>

<div class="overlay">
  <div class="spinner">
    <svg viewBox="0 0 100 100">
      <circle class="circle-background" />
      <circle class="circle-progress" />
      <text x="50" y="54" text-anchor="middle" class="spinner-text">Loading</text>
    </svg>
  </div>
</div>
