<script lang="ts">
  import { Label, Input } from "flowbite-svelte";

  export let id;
  export let label;
  export let bind_value:any;
</script>

<div>
  <Label for={id}>{label}</Label>
  <Input type="date" id={id} bind:value={bind_value} />
</div>
