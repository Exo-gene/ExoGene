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

<Modal
  title="Confirm Deletion"
  style="background-color: var(--mainBackgroundColor); color: var(--textColor);"
  bind:open
  class="max-w-sm mx-auto"
  classHeader="modal-header"
  classFooter="modal-footer"
>
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

<style>
  :global(.modal-header) {
    background-color: var(--mainBackgroundColor) !important;
    color: var(--textColor) !important;
  }
  :global(.modal-footer) {
    background-color: var(--mainBackgroundColor) !important;
    color: var(--textColor) !important;
  }
</style>
