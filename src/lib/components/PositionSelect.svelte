<script lang="ts">
  import { Label, Select } from "flowbite-svelte";

  export let positions: any = [];
  export let selectPosition: (event: any) => void;
  export let selectedPosition: string;
</script>

<div>
  <Label for="position-select">Select Position</Label>
  <Select id="position-select" bind:value={selectedPosition} on:change={selectPosition}>
    {#each positions as position}
      <option value={position}>
        {position}
      </option>
    {/each}
  </Select>
</div>
