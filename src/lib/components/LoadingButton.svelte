<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Spinner } from "flowbite-svelte";

  export let isLoading = false;
  export let width = "w-44";
  export let height = "h-12";


  const dispatch = createEventDispatcher();

  function handleClick(event: Event) {
    if (!isLoading) {
      dispatch("click", event);
    }
  }
</script>

<button
  class={`hover-button ${width} ${height} duration-300 ease-in-out rounded-lg flex items-center justify-center`}
  on:click={handleClick}
  disabled={isLoading}
>
  {#if isLoading}
    <Spinner class="me-3" size="4" color="white" />
   {/if}
</button>

<style>
  .hover-button {
    background-color: var(--mainBackgroundColor);
    color: white;
  }
  .hover-button:hover {
    background-color: var(--hoverBackgroundColor);
  }
</style>
