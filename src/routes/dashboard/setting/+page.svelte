<script lang="ts">
  import Role from "$lib/components/Modals/Role.Modal.Component.svelte";
  import { Button } from "flowbite-svelte";

  let isLoading: boolean = false;
  let roleModal: boolean = false;
</script>

<Button
  on:click={() => (roleModal = true)}
  class="w-80 h-60   rounded-lg flex justify-center items-center text-center text-xl  duration-300 ease-in-out"
  >{"Role Settings"}</Button
>
<Role bind:isLoading bind:roleModal />
