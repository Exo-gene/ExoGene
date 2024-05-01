<script lang="ts">
  import InsertButton from "../../../lib/components/InsertButton.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { categoriesStore } from "../../../stores/categoriesStore";
  import { formatDateTime } from "$lib/utils/formatDateTime";
  import ConfirmDeleteModal from "$lib/components/ConfirmDeleteModal.svelte";
  import CustomTable from "$lib/components/CustomTable.svelte";

  let openModal = false;
  let itemIdToDelete: number;
  let currentPage = 1;
  let totalPages = 1;
  const pageSize = 2;

  // Ensure that fetching next page does not exceed total pages
  function nextPage() {
    if (currentPage < totalPages) {
      fetchCategories(currentPage + 1);
    }
  }

  // Prevent fetching previous page if it's the first page
  function previousPage() {
    if (currentPage > 1) {
      fetchCategories(currentPage - 1);
    }
  }

  // Function to fetch categories for a specific page
  function fetchCategories(page: number) {
    currentPage = page;
    categoriesStore.getCategoriesData(supabase, pageSize, currentPage);
  }

  // Fetch initial data
  onMount(() => {
    fetchCategories(currentPage);
  });

  function createCategory() {
    goto("/dashboard/categories/create");
  }

  // Function to delete a category
  function handleDelete(event: any) {
    itemIdToDelete = event.detail;
    openModal = true;
  }
  async function deleteCategory() {
    try {
      await categoriesStore.deleteCategoryData(itemIdToDelete, supabase);
      console.log(`Category with ID ${itemIdToDelete} deleted successfully.`);
      openModal = false;
    } catch (error) {
      console.error("Error deleting category:", error);
      openModal = false;
    }
  }

  const tableHeaders = ["ID", "Created At", "Title", "Language", "Action"];
  $: totalPages = Math.ceil($categoriesStore[0]?.count / pageSize);

  let categories = $categoriesStore[0]?.items || [];
</script>

<div class="mx-2">
  <InsertButton insertData={createCategory} />
  <CustomTable
    {tableHeaders}
    {categories}
    on:delete={handleDelete}
    {currentPage}
    {totalPages}
    {previousPage}
    {nextPage}
    {formatDateTime}
  />
</div>

<!-- Parent Component -->
<ConfirmDeleteModal bind:open={openModal} on:confirm={deleteCategory} />
