<script lang="ts">
  import { Policies } from "./../../../lib/Models/Enums/Policies.Enum.Model";
  import InsertButton from "../../../lib/components/InsertButton.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import ConfirmDeleteModal from "$lib/components/ConfirmDeleteModal.svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import { magazineStore } from "../../../stores/magazineStore";
  import CustomTable from "$lib/components/CustomTable.svelte";
  import PaginationControls from "$lib/components/PaginationControls.svelte";
  import { authStore } from "../../../stores/Auth.Store";
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils";

  let openModal = false;
  let itemIdToDelete: number | null = null;
  let currentPage = 1;
  let totalPages = 1;
  const pageSize = 10;
  let isLoading = true;

  // Fetch initial data
  onMount(() => {
    fetchCategories(currentPage);
    isLoading = false;
  });

  // Function to fetch categories for a specific page
  function fetchCategories(page: number) {
    currentPage = page;
    magazineStore.getMagazineData(supabase, pageSize, currentPage);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      fetchCategories(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      fetchCategories(currentPage - 1);
    }
  }

  function createMagazine() {
    goto("/dashboard/magazine/create");
  }

  // Function to delete a category
  function handleDelete(itemId: number) {
    itemIdToDelete = itemId;
    openModal = true;
  }
  // Function to delete a category
  async function deleteMagazine() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      await magazineStore.deleteMagazineData(itemIdToDelete, supabase);
      itemIdToDelete = null;
      fetchCategories(currentPage);
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      openModal = false;
    }
  }

  function editMagazine(magazineId: number) {
    goto(`/dashboard/magazine/${magazineId}`);
  }

  const tableHeaders = ["ID", "Created At", "Language", "Number", "Action"];
  $: totalPages = Math.ceil($magazineStore[0]?.count / pageSize);
  let magazine = $magazineStore[0]?.items;
  $: magazine = $magazineStore[0]?.items;
</script>

{#if isLoading}
  <LoadingIndicator />
{:else}
  <div class="mx-2">
    {#if checkUserPolicies([Policies.CREATE_MAGAZINE], $authStore)}
      <InsertButton insertData={createMagazine} />
    {/if}
    <CustomTable
      items={magazine}
      editData={editMagazine}
      {handleDelete}
      {tableHeaders}
      pageName="magazine"
    />
    <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
    <ConfirmDeleteModal bind:open={openModal} on:confirm={deleteMagazine} />
  </div>
{/if}
