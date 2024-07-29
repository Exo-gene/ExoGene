<script lang="ts">
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils"; 
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { statusStore } from "../../../stores/statusStore";
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
    fetchStatusData(currentPage);
    isLoading = false;
  });

  // Function to fetch status for a specific page
  function fetchStatusData(page: number) {
    currentPage = page;
    statusStore.getStatusData(supabase, pageSize, currentPage);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      fetchStatusData(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      fetchStatusData(currentPage - 1);
    }
  }

  
  // Function to delete a status
  function handleDelete(itemId: number) {
    itemIdToDelete = itemId;
    openModal = true;
  }
  // Function to delete a status
  async function deleteStatusData() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      await statusStore.deleteStatusData(
        itemIdToDelete,
        supabase
      );
      itemIdToDelete = null;
      fetchStatusData(currentPage);
    } catch (error) {
      console.error("Error deleting status:", error);
    } finally {
      openModal = false;
    }
  }

  function editStatus(statusId: number) {
    goto(`/dashboard/status/${statusId}`);
  }

  const tableHeaders = ["ID", "Created At", "Name", "Action"];
  $: totalPages = Math.ceil($statusStore[0]?.count / pageSize);
  let statusData = $statusStore[0]?.items;
  $: statusData = $statusStore[0]?.items || [];
 

  function createStatus() {
    goto("/dashboard/status/create");
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
       Status Data
      </h1>
      <!-- insert new data -->
      {#if checkUserPolicies([Policies.CREATE_STATUS], $authStore)}
      <ButtonComponent title="Add" dispatch={() => createStatus()} />
       {/if}
    </div>

    <!-- Table data -->
  <CustomTable
      items={statusData}
      editData={editStatus}
      {handleDelete}
      {tableHeaders}
      pageName="status"
    />
  {/if}
 <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
</div>

 <ConfirmDeleteModal
      bind:open={openModal}
      on:confirm={deleteStatusData}
    />