<script>
  import imageGIF from "../images/animation.gif";
</script>

<div class="gif-container">
  <img src={imageGIF} alt="Loading Animation" />
</div>

<style>
  .gif-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    margin: 0;
  }

  .gif-container img {
    width: 100px;
    height: auto;
  }
</style>
