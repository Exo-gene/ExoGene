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
  import { LanguageEnum } from "../../../models/languageEnum";
  import { formatDateTime } from "$lib/utils/formatDateTime";
  import ConfirmDeleteModal from "$lib/components/ConfirmDeleteModal.svelte";
  import PaginationControls from "$lib/components/PaginationControls.svelte";
  import IconTrash from "@tabler/icons-svelte/IconTrash.svelte";
  import IconEdit from "@tabler/icons-svelte/IconEdit.svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import { carouselStore } from "../../../stores/carouselStore";

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
    carouselStore.getCarouselData(supabase, pageSize, currentPage);
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

  function createCarousel() {
    goto("/dashboard/carousel/create");
  }

  // Function to delete a category
  function handleDelete(itemId: number) {
    itemIdToDelete = itemId;
    openModal = true;
  }
  // Function to delete a category
  async function deleteCarousel() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      await carouselStore.deleteCarouselData(itemIdToDelete, supabase);
      itemIdToDelete = null;
      fetchCategories(currentPage);
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      openModal = false;
    }
  }

  function editCarousel(carouselId: number) {
    goto(`/dashboard/carousel/${carouselId}`);
  }

  const tableHeaders = ["ID", "Created At", "Language", "Title", "Action"];
  $: totalPages = Math.ceil($carouselStore[0]?.count / pageSize);
  let carousel = $carouselStore[0]?.items;
  $: carousel = $carouselStore[0]?.items;
</script>

{#if isLoading}
  <LoadingIndicator />
{:else if $carouselStore[0]?.items.length > 0}
  <div class="mx-2">
    <InsertButton insertData={createCarousel} />
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
        {#each carousel as carouselItem}
          <TableBodyRow
            style="background-color: var(--tableBackgroundColor); color:var(--tableColor)"
          >
            <TableBodyCell class="!p-4"></TableBodyCell>
            <TableBodyCell>{carouselItem.id}</TableBodyCell>
            <TableBodyCell class="font-semibold text-gray-700">
              {formatDateTime(carouselItem.created_at.toString())}
            </TableBodyCell>
            <TableBodyCell>
              {#each carouselItem.carouseltranslation as translation}
                {#if translation.language === LanguageEnum.EN}
                  <span>{translation.language}</span>
                {/if}
              {/each}
            </TableBodyCell>
            <TableBodyCell class="font-semibold text-gray-700">
              {#each carouselItem.carouseltranslation as translation}
                {#if translation.language === LanguageEnum.EN}
                  <span>{translation.title}</span>
                {/if}
              {/each}
            </TableBodyCell>
            <TableBodyCell class="flex space-x-3">
              <button
                class="font-medium text-green-600 hover:underline dark:text-green-600"
                on:click={() => editCarousel(carouselItem.id)}
              >
                <IconEdit stroke={2} class="text-green-700" />
              </button>
              <button on:click={() => handleDelete(carouselItem.id)}
                ><IconTrash stroke={2} class="text-red-700" /></button
              >
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
    <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
    <ConfirmDeleteModal bind:open={openModal} on:confirm={deleteCarousel} />
  </div>
{/if}
