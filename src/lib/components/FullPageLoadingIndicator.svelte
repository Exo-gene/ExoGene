<script>
  import loadingGIF from "../images/loading.gif";
</script>

<div class="gif-container">
  <img src={loadingGIF} alt="Loading Animation" />
</div>

<style>
  .gif-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
  }

  .gif-container img {
    height: auto;
  }
</style>
