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
  import { tagStore } from "../../../stores/tagsStore";

  let openModal = false;
  let itemIdToDelete: number | null = null;
  let currentPage = 1;
  let totalPages = 1;
  const pageSize = 2;
  let isLoading = true;

  // Fetch initial data
  onMount(() => {
    fetchTags(currentPage);
    isLoading = false;
  });
  // Function to fetch tags for a specific page
  function fetchTags(page: number) {
    currentPage = page;
    tagStore.getTagsData(supabase, pageSize, currentPage);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      fetchTags(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      fetchTags(currentPage - 1);
    }
  }

  function createTag() {
    goto("/dashboard/tags/create");
  }

  // Function to delete a tag
  function handleDelete(itemId: number) {
    itemIdToDelete = itemId;
    openModal = true;
  }

  // Function to delete a tag
  async function deleteTag() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      await tagStore.deleteTagData(itemIdToDelete, supabase);
      itemIdToDelete = null;
      fetchTags(currentPage);
    } catch (error) {
      console.error("Error deleting tag:", error);
    } finally {
      openModal = false;
    }
  }
  function editTag(tagId: number) {
    goto(`/dashboard/tags/${tagId}`);
  }

  const tableHeaders = ["ID", "Created At", "Title", "Language", "Action"];
  $: totalPages = Math.ceil($tagStore[0]?.count / pageSize);
  let tags = $tagStore[0]?.items;
  $: tags = $tagStore[0]?.items || [];
</script>

{#if isLoading}
  <LoadingIndicator />
{:else if $tagStore[0]?.items.length > 0}
  <div class="mx-2">
    <InsertButton insertData={createTag} />
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
        {#each tags as tagItem}
          <TableBodyRow
            style="background-color: var(--tableBackgroundColor); color:var(--tableColor)"
          >
            <TableBodyCell class="!p-4"></TableBodyCell>
            <TableBodyCell>{tagItem.id}</TableBodyCell>
            <TableBodyCell class="font-semibold text-gray-700">
            {formatDateTime(tagItem.created_at.toString())}
            </TableBodyCell>
            {#each tagItem.tagtranslation as translation}
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
              <button
                class="font-medium text-green-600 hover:underline dark:text-green-600"
                on:click={() => editTag(tagItem.id)}
              >
                <IconEdit stroke={2} class="text-green-700" />
              </button>
              <button on:click={() => handleDelete(tagItem.id)}
                ><IconTrash stroke={2} class="text-red-700" /></button
              >
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
    <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
    <ConfirmDeleteModal bind:open={openModal} on:confirm={deleteTag} />
  </div>
{/if}
