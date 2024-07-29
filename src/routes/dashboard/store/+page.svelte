<script lang="ts">
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils"; 
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { storeDataStore } from "../../../stores/storeDataStore";
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
    fetchStoreData(currentPage);
    isLoading = false;
  });

  // Function to fetch store for a specific page
  function fetchStoreData(page: number) {
    currentPage = page;
    storeDataStore.getStoreData(supabase, pageSize, currentPage);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      fetchStoreData(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      fetchStoreData(currentPage - 1);
    }
  }

  
  // Function to delete a store
  function handleDelete(itemId: number) {
    itemIdToDelete = itemId;
    openModal = true;
  }
  // Function to delete a store
  async function deleteStoreData() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      await storeDataStore.deleteStoreData(
        itemIdToDelete,
        supabase
      );
      itemIdToDelete = null;
      fetchStoreData(currentPage);
    } catch (error) {
      console.error("Error deleting store:", error);
    } finally {
      openModal = false;
    }
  }

  function editStore(storeId: number) {
    goto(`/dashboard/store/${storeId}`);
  }

  const tableHeaders = ["ID", "Created At", "company Name","amount","lot Number","Item Name","registered Date","expiration Date", "Action"];
  $: totalPages = Math.ceil($storeDataStore[0]?.count / pageSize);
  let storeData = $storeDataStore[0]?.items;
  $: storeData = $storeDataStore[0]?.items || [];
 

  function createStoreData() {
    goto("/dashboard/store/create");
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
       Store List
      </h1>
      <!-- insert new data -->
      {#if checkUserPolicies([Policies.CREATE_STORE], $authStore)}
      <ButtonComponent title="Add" dispatch={() => createStoreData()} />
       {/if}
    </div>

    <!-- Table data -->
  <CustomTable
      items={storeData}
      editData={editStore}
      {handleDelete}
      {tableHeaders}
      pageName="store"
    />
  {/if}
 <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
</div>

 <ConfirmDeleteModal
      bind:open={openModal}
      on:confirm={deleteStoreData}
    />