<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let width: string = "100%";
  export let height: string = "4rem";
  export let icon: any;
  export let label: string;
  export let onClick: () => void = () => {};

  let backgroundColor: string = "var(--buttonBackgroundColor)";
  let textColor: string = "var(--textColor)";

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch("click");
    onClick();
  }
</script>

<button
  style="background-color: {backgroundColor}; color: {textColor}; width: {width}; height: {height};"
  class="font-semibold rounded flex items-center justify-center gap-2"
  on:click={handleClick}
>
  <svelte:component this={icon} stroke={2} />
  {label}
</button>
