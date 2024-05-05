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
  } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { advertisementStore } from "../../../stores/advertisementStore";
  import { LanguageEnum } from "../../../models/languageEnum";
  import { formatDateTime } from "$lib/utils/formatDateTime";
  import ConfirmDeleteModal from "$lib/components/ConfirmDeleteModal.svelte";
  import PaginationControls from "$lib/components/PaginationControls.svelte";
  import IconTrash from "@tabler/icons-svelte/IconTrash.svelte";
  import IconEdit from "@tabler/icons-svelte/IconEdit.svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";

  let openModal = false;
  let itemIdToDelete: number | null = null;
  let currentPage = 1;
  let totalPages = 1;
  const pageSize = 2;
  let isLoading = true;

  // Fetch initial data
  onMount(() => {
    fetchCategories(currentPage);
    isLoading = false;
  });

  // Function to fetch categories for a specific page
  function fetchCategories(page: number) {
    currentPage = page;
    advertisementStore.getAdvertisementData(supabase, pageSize, currentPage);
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

  function createAdvertisement() {
    goto("/dashboard/advertisements/create");
  }

  // Function to delete a category
  function handleDelete(itemId: number) {
    itemIdToDelete = itemId;
    openModal = true;
  }
  // Function to delete a category
  async function deleteAdvertisement() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      await advertisementStore.deleteAdvertisementData(
        itemIdToDelete,
        supabase
      );
      itemIdToDelete = null;
      fetchCategories(currentPage);
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      openModal = false;
    }
  }

  function editCategory(categoryId: number) {
    goto(`/dashboard/categories/${categoryId}`);
  }

  const tableHeaders = ["ID", "Created At",  "Language", "Action"];
  $: totalPages = Math.ceil($advertisementStore[0]?.count / pageSize);
  let categories = $advertisementStore[0]?.items;
  $: categories = $advertisementStore[0]?.items || [];
</script>

{#if isLoading}
  <LoadingIndicator />
{:else if $advertisementStore[0]?.items.length > 0}
  <div class="mx-2">
    <InsertButton insertData={createAdvertisement} />
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
        {#each categories as category}
          <TableBodyRow
            style="background-color: var(--tableBackgroundColor); color:var(--tableColor)"
          >
            <TableBodyCell class="!p-4"></TableBodyCell>
            <TableBodyCell>{category.id}</TableBodyCell>
            <TableBodyCell class="font-semibold text-gray-700">
              {formatDateTime(category.created_at)}
            </TableBodyCell>
            {#each category.advertisementtranslation as translation}
              {#if translation.language === LanguageEnum.EN}
                <TableBodyCell>
                  <span>{translation.language}</span>
                </TableBodyCell>
              {/if}
            {/each}
            <TableBodyCell class="flex space-x-3">
              <button
                class="font-medium text-green-600 hover:underline dark:text-green-600"
                on:click={() => editCategory(category.id)}
              >
                <IconEdit stroke={2} class="text-green-700" />
              </button>
              <button on:click={() => handleDelete(category.id)}
                ><IconTrash stroke={2} class="text-red-700" /></button
              >
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
    <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
    <ConfirmDeleteModal
      bind:open={openModal}
      on:confirm={deleteAdvertisement}
    />
  </div>
{/if}
