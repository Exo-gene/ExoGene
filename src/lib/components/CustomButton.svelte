<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let width: string = "100%";
  export let height: string = "4rem";
  export let icon: any;
  export let label: string;
  export let onClick: () => void = () => {};

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch("click");
    onClick();
  }
</script>

<button
  style="width: {width}; height: {height};"
  class="hover-button font-semibold rounded flex items-center justify-center gap-2"
  on:click={handleClick}
>
  <svelte:component this={icon} stroke={2} />
  {label}
</button>

<style>
  .hover-button {
    background-color: var(--backgroundButtonColor);
    border: 1px solid var(--backgroundButtonColor);
    color: var(--textColor);
    transition: background-color 0.3s, color 0.3s; /* Smooth transition for hover effect */
  }
  .hover-button:hover {
    background-color: var(--hoverBackgroundColor);
    color: var(--hoverTextColor);
  }
</style>
