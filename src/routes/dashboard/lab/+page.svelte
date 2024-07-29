<script lang="ts">
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils"; 
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { labStore } from "../../../stores/labStore";
  import ConfirmDeleteModal from "$lib/components/ConfirmDeleteModal.svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import CustomTable from "$lib/components/CustomTable.svelte";
  import PaginationControls from "$lib/components/PaginationControls.svelte";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";
  import { authStore } from "../../../stores/Auth.Store";
  import ButtonComponent from "../../../lib/components/ButtonComponent.svelte";

  let openModal = false;
  let itemIdToDelete: number | null = null;
  let currentPage = 1;
  let totalPages = 1;
  const pageSize = 10;
  let isLoading = true;

  // Fetch initial data
  onMount(() => {
    fetchLabData(currentPage);
    isLoading = false;
  });

  // Function to fetch lab for a specific page
  function fetchLabData(page: number) {
    currentPage = page;
    labStore.getLabData(supabase, pageSize, currentPage);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      fetchLabData(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      fetchLabData(currentPage - 1);
    }
  }

  
  // Function to delete a lab
  function handleDelete(itemId: number) {
    itemIdToDelete = itemId;
    openModal = true;
  }
  // Function to delete a lab
  async function deleteLabData() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      await labStore.deleteLabData(
        itemIdToDelete,
        supabase
      );
      itemIdToDelete = null;
      fetchLabData(currentPage);
    } catch (error) {
      console.error("Error deleting lab:", error);
    } finally {
      openModal = false;
    }
  }

  function editLab(labId: number) {
    goto(`/dashboard/lab/${labId}`);
  }

  const tableHeaders = ["ID", "Created At", "Name","Address", "Action"];
  $: totalPages = Math.ceil($labStore[0]?.count / pageSize);
  let labData = $labStore[0]?.items;
  $: labData = $labStore[0]?.items || [];
 

  function createLab() {
    goto("/dashboard/lab/create");
  }
</script>

 <div class="max-w-screen-2xl mx-auto py-10">
  {#if isLoading}
    <div class="flex justify-center items-center">
      <LoadingIndicator />
    </div>
  {:else}
    <!-- Header Section -->
    <div class="w-full flex items-center justify-between py-4">
       <ButtonComponent title="Back" dispatch={() => goto("/dashboard/home")} />
      <h1
        class="font-bold text-center flex-grow"
        style="color: var(--titleColor);"
      >
       Lab / Hospital
      </h1>
      <!-- insert new data -->
      {#if checkUserPolicies([Policies.CREATE_LAB], $authStore)}
      <ButtonComponent title="Add" dispatch={() => createLab()} />
       {/if}
    </div>

    <!-- Table data -->
  <CustomTable
      items={labData}
      editData={editLab}
      {handleDelete}
      {tableHeaders}
      pageName="lab"
    />
  {/if}
 <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
</div>

 <ConfirmDeleteModal
      bind:open={openModal}
      on:confirm={deleteLabData}
    />