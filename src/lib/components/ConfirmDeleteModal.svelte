<script lang="ts">
  import { Modal, Button } from "flowbite-svelte";
  import { createEventDispatcher } from "svelte";
  import Toast from "./Toast.svelte";

  export let message: string = "Are you sure you want to delete this item?";
  export let open: boolean = false;
  let showToast = false;

  const dispatch = createEventDispatcher();

  function confirmDeletion() {
    dispatch("confirm");
    open = false;
    showToast = true;
    setTimeout(() => (showToast = false), 3000);
  }

  function cancelDeletion() {
    open = false;
  }
</script>

<Modal title="Confirm Deletion" bind:open class="bg-white max-w-sm mx-auto">
  <p>{message}</p>
  <svelte:fragment slot="footer">
    <Button on:click={confirmDeletion} color="red" class="border">Delete</Button
    >
    <Button on:click={cancelDeletion} color="gray" class="border">Cancel</Button
    >
  </svelte:fragment>
</Modal>
{#if showToast}
  <Toast message="Item deleted successfully" type="success" />
{/if}
