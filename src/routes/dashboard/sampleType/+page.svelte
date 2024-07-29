<script lang="ts">
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils"; 
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { sampleTypeStore } from "../../../stores/sampleTypeStore";
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
    fetchSampleTypeData(currentPage);
    isLoading = false;
  });

  // Function to fetch sampleType for a specific page
  function fetchSampleTypeData(page: number) {
    currentPage = page;
    sampleTypeStore.getSampleTypesData(supabase, pageSize, currentPage);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      fetchSampleTypeData(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      fetchSampleTypeData(currentPage - 1);
    }
  }

  
  // Function to delete a sampleType
  function handleDelete(itemId: number) {
    itemIdToDelete = itemId;
    openModal = true;
  }
  // Function to delete a sampleType
  async function deleteSampleTypeData() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      await sampleTypeStore.deleteSampleTypeData(
        itemIdToDelete,
        supabase
      );
      itemIdToDelete = null;
      fetchSampleTypeData(currentPage);
    } catch (error) {
      console.error("Error deleting sampleType:", error);
    } finally {
      openModal = false;
    }
  }

  function editSampleType(sampleTypeId: number) {
    goto(`/dashboard/sampleType/${sampleTypeId}`);
  }

  const tableHeaders = ["ID", "Created At", "Name", "Action"];
  $: totalPages = Math.ceil($sampleTypeStore[0]?.count / pageSize);
  let sampleTypeData = $sampleTypeStore[0]?.items;
  $: sampleTypeData = $sampleTypeStore[0]?.items || [];
 

  function createSampleType() {
    goto("/dashboard/sampleType/create");
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
       SampleType List
      </h1>
      <!-- insert new data -->
      {#if checkUserPolicies([Policies.CREATE_SAMPLETYPE], $authStore)}
      <ButtonComponent title="Add" dispatch={() => createSampleType()} />
       {/if}
    </div>

    <!-- Table data -->
  <CustomTable
      items={sampleTypeData}
      editData={editSampleType}
      {handleDelete}
      {tableHeaders}
      pageName="sampleType"
    />
  {/if}
 <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
</div>

 <ConfirmDeleteModal
      bind:open={openModal}
      on:confirm={deleteSampleTypeData}
    />