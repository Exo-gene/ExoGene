<script lang="ts">
  import { Label, Select } from "flowbite-svelte";

  export let positions:any = [];
  export let selectPosition;
  export let selectedPosition;
</script>

<div>
  <Label for="position-select">Select Position</Label>
  <Select id="position-select" on:change={selectPosition}>
    {#each positions as position}
      <option value={position} selected={position === selectedPosition}>
        {position}
      </option>
    {/each}
  </Select>
</div>
