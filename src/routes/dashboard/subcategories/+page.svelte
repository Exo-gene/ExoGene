<script lang="ts">
  import InsertButton from "../../../lib/components/InsertButton.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { subCategoriesStore } from "../../../stores/subcategoriesStore";
  import ConfirmDeleteModal from "$lib/components/ConfirmDeleteModal.svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import CustomTable from "$lib/components/CustomTable.svelte";
  import PaginationControls from "$lib/components/PaginationControls.svelte";

  let openModal = false;
  let itemIdToDelete: number | null = null;
  let currentPage = 1;
  let totalPages = 1;
  const pageSize = 2;
  let isLoading = true;

  // Fetch initial data
  onMount(() => {
    fetchSubCategories(currentPage);
    isLoading = false;
  });
  // Function to fetch categories for a specific page
  function fetchSubCategories(page: number) {
    currentPage = page;
    subCategoriesStore.getSubCategoriesData(supabase, pageSize, currentPage);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      fetchSubCategories(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      fetchSubCategories(currentPage - 1);
    }
  }

  function createSubCategory() {
    goto("/dashboard/subcategories/create");
  }

  // Function to delete a category
  function handleDelete(itemId: number) {
    itemIdToDelete = itemId;
    openModal = true;
  }

  // Function to delete a category
  async function deleteSubCategory() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      await subCategoriesStore.deleteSubCategoryData(itemIdToDelete, supabase);
      itemIdToDelete = null;
      fetchSubCategories(currentPage);
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      openModal = false;
    }
  }
  function editSubCategory(subcategoryId: number) {
    goto(`/dashboard/subcategories/${subcategoryId}`);
  }

  const tableHeaders = ["ID", "Created At", "Title", "Language", "Action"];
  $: totalPages = Math.ceil($subCategoriesStore[0]?.count / pageSize);
  let subcategories = $subCategoriesStore[0]?.items;
  $: subcategories = $subCategoriesStore[0]?.items || [];
</script>

{#if isLoading}
  <LoadingIndicator />
{:else}
  <div class="mx-2">
    <InsertButton insertData={createSubCategory} />
    <CustomTable
      items={subcategories}
      editData={editSubCategory}
      {handleDelete}
      {tableHeaders}
      pageName="subcategory"
    />
    <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
    <ConfirmDeleteModal bind:open={openModal} on:confirm={deleteSubCategory} />
  </div>
{/if}
