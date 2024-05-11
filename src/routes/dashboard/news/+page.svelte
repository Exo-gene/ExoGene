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
  import { newsStore } from "../../../stores/newsStore";
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
    fetchNews(currentPage);
    isLoading = false;
  });

  // Function to fetch news for a specific page
  function fetchNews(page: number) {
    currentPage = page;
    newsStore.getNewsData(supabase, pageSize, currentPage);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      fetchNews(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      fetchNews(currentPage - 1);
    }
  }

  function createNews() {
    goto("/dashboard/news/create");
  }

  // Function to delete a news
  function handleDelete(itemId: number) {
    itemIdToDelete = itemId;
    openModal = true;
  }
  // Function to delete a news
  async function deleteNews() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      await newsStore.deleteNewsData(itemIdToDelete, supabase);
      itemIdToDelete = null;
      fetchNews(currentPage);
    } catch (error) {
      console.error("Error deleting news:", error);
    } finally {
      openModal = false;
    }
  }

  function editNews(newsId: number) {
    goto(`/dashboard/news/${newsId}`);
  }

  const tableHeaders = ["ID", "Created At", "Title", "Language", "Action"];
  $: totalPages = Math.ceil($newsStore[0]?.count / pageSize);
  let news = $newsStore[0]?.items;
  $: news = $newsStore[0]?.items || [];
</script>

{#if isLoading}
  <LoadingIndicator />
{:else if $newsStore[0]?.items.length > 0}
  <div class="mx-2">
    <InsertButton insertData={createNews} />
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
        {#each news as newsItem}
          <TableBodyRow
            style="background-color: var(--tableBackgroundColor); color:var(--tableColor)"
          >
            <TableBodyCell class="!p-4"></TableBodyCell>
            <TableBodyCell>{newsItem.id}</TableBodyCell>
            <TableBodyCell class="font-semibold text-gray-700">
              {formatDateTime(newsItem.created_at.toString())}
            </TableBodyCell>
            {#each newsItem.newstranslation as translation}
              {#if translation.language === LanguageEnum.EN}
                <TableBodyCell>
                 <span>{translation.title.slice(0, 40)}{translation.title.length > 40 ? '...' : ''}</span>
                </TableBodyCell>
                <TableBodyCell>
                  <span>{translation.language}</span>
                </TableBodyCell>
              {/if}
            {/each}
            <TableBodyCell class="flex space-x-3">
              <button
                class="font-medium text-green-600 hover:underline dark:text-green-600"
                on:click={() => editNews(newsItem.id)}
              >
                <IconEdit stroke={2} class="text-green-700" />
              </button>
              <button on:click={() => handleDelete(newsItem.id)}
                ><IconTrash stroke={2} class="text-red-700" /></button
              >
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
    <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
    <ConfirmDeleteModal bind:open={openModal} on:confirm={deleteNews} />
  </div>
{/if}
