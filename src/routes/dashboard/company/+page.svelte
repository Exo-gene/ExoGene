<script lang="ts">
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils"; 
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { companyStore } from "../../../stores/companyStore";
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
    fetchCompanyData(currentPage);
    isLoading = false;
  });

  // Function to fetch company for a specific page
  function fetchCompanyData(page: number) {
    currentPage = page;
    companyStore.getCompanyData(supabase, pageSize, currentPage);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      fetchCompanyData(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      fetchCompanyData(currentPage - 1);
    }
  }

  
  // Function to delete a company
  function handleDelete(itemId: number) {
    itemIdToDelete = itemId;
    openModal = true;
  }
  // Function to delete a company
  async function deleteCompanyData() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      await companyStore.deleteCompanyData(
        itemIdToDelete,
        supabase
      );
      itemIdToDelete = null;
      fetchCompanyData(currentPage);
    } catch (error) {
      console.error("Error deleting company:", error);
    } finally {
      openModal = false;
    }
  }

  function editCompanyData(companyId: number) {
    goto(`/dashboard/company/${companyId}`);
  }

  const tableHeaders = ["ID", "Created At", "Name","Address", "Action"];
  $: totalPages = Math.ceil($companyStore[0]?.count / pageSize);
  let companyData = $companyStore[0]?.items;
  $: companyData = $companyStore[0]?.items || [];
 

  function createCompany() {
    goto("/dashboard/company/create");
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
       Company List
      </h1>
      <!-- insert new data -->
      {#if checkUserPolicies([Policies.CREATE_COMPANY], $authStore)}
      <ButtonComponent title="Add" dispatch={() => createCompany()} />
       {/if}
    </div>

    <!-- Table data -->
  <CustomTable
      items={companyData}
      editData={editCompanyData}
      {handleDelete}
      {tableHeaders}
      pageName="company"
    />
  {/if}
 <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
</div>

 <ConfirmDeleteModal
      bind:open={openModal}
      on:confirm={deleteCompanyData}
    />