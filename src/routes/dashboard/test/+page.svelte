<script lang="ts">
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils"; 
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { testStore } from "../../../stores/testStore";
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
    fetchTestData(currentPage);
    isLoading = false;
  });

  // Function to fetch test for a specific page
  function fetchTestData(page: number) {
    currentPage = page;
    testStore.getTestData(supabase, pageSize, currentPage);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      fetchTestData(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      fetchTestData(currentPage - 1);
    }
  }

  
  // Function to delete a test
  function handleDelete(itemId: number) {
    itemIdToDelete = itemId;
    openModal = true;
  }
  // Function to delete a test
  async function deleteTestData() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      await testStore.deleteTestData(
        itemIdToDelete,
        supabase
      );
      itemIdToDelete = null;
      fetchTestData(currentPage);
    } catch (error) {
      console.error("Error deleting test:", error);
    } finally {
      openModal = false;
    }
  }

  function editTestData(testId: number) {
    goto(`/dashboard/test/${testId}`);
  }

  const tableHeaders = ["ID", "Created At", "Name","Price", "Action"];
  $: totalPages = Math.ceil($testStore[0]?.count / pageSize);
  let testData = $testStore[0]?.items;
  $: testData = $testStore[0]?.items || [];
 

  function createTestData() {
    goto("/dashboard/test/create");
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
      Test List
      </h1>
      <!-- insert new data -->
      {#if checkUserPolicies([Policies.CREATE_TEST], $authStore)}
      <ButtonComponent title="Add" dispatch={() => createTestData()} />
       {/if}
    </div>

    <!-- Table data -->
  <CustomTable
      items={testData}
      editData={editTestData}
      {handleDelete}
      {tableHeaders}
      pageName="test"
    />
  {/if}
 <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
</div>

 <ConfirmDeleteModal
      bind:open={openModal}
      on:confirm={deleteTestData}
    />