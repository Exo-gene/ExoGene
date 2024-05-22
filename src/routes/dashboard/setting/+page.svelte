<script lang="ts">
  import Role from "$lib/components/Modals/Role.Modal.Component.svelte";

  let isLoading: boolean = false;
  let roleModal: boolean = false;
</script>

<button
  on:click={() => (roleModal = true)}
  class="w-80 h-60 bg-white dark:bg-ekhlas-main-light dark:text-white rounded-lg flex justify-center items-center text-center text-xl hover:bg-[#FB5B01A4] hover:dark:bg-ekhlas-table-light hover:text-white duration-300 ease-in-out"
  >{"Role Settings"}</button
>

<Role bind:isLoading bind:roleModal />
