<script lang="ts">
  import InsertButton from "../../../lib/components/InsertButton.svelte";
  import { goto } from "$app/navigation";
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Checkbox,
  } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { categoriesStore } from "../../../stores/categoriesStore";
  import { LanguageEnum } from "../../../models/languageEnum";
  import { formatDateTime } from "$lib/utils/formatDateTime";
  import EditButton from "$lib/components/EditButton.svelte";
  import ConfirmDeleteModal from "$lib/components/ConfirmDeleteModal.svelte";
  import type { CategoryModel } from "../../../models/categoryModel";
  import { Pagination } from "flowbite-svelte";
  import PaginationControls from "$lib/components/PaginationControls.svelte";

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
  function openDeleteModal(categoryId: number) {
    itemIdToDelete = categoryId;
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
</script>

<div class="mx-2">
  <InsertButton insertData={createCategory} />
  <div>
    <Table>
      <TableHead
        style="background-color: var(--tableHeaderBackgroundColor); color:var(--tableHeaderColor)"
      >
        <TableHeadCell class="!p-4"></TableHeadCell>
        {#each tableHeaders as header}
          <TableHeadCell>{header}</TableHeadCell>
        {/each}
      </TableHead>
      <TableBody tableBodyClass="divide-y">
        {#each $categoriesStore[0]?.items || [] as category}
          <TableBodyRow
            style="background-color: var(--tableBackgroundColor); color:var(--tableColor)"
          >
            <TableBodyCell class="!p-4"></TableBodyCell>
            <TableBodyCell>{category.id}</TableBodyCell>
            <TableBodyCell class="font-semibold text-gray-700"
              >{formatDateTime(category.created_at)}</TableBodyCell
            >
            {#each category.categorytranslation || [] as translation}
              {#if translation.language === LanguageEnum.EN}
                <TableBodyCell>
                  <span>{translation.title}</span>
                </TableBodyCell>
                <TableBodyCell>
                  <span>{translation.language}</span>
                </TableBodyCell>
              {/if}
            {/each}

            <TableBodyCell class="flex space-x-3">
              <EditButton categoryId={category.id} pageLink="categories" />
              <button
                class="font-medium text-red-600 hover:underline dark:text-red-500"
                on:click={() => openDeleteModal(category.id)}
              >
                <span>Delete</span>
              </button>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </div>

  <div>
    <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
  </div>
</div>

<!-- Parent Component -->
<ConfirmDeleteModal bind:open={openModal} on:confirm={deleteCategory} />
