<script lang="ts">
  import InsertButton from "../../../lib/components/InsertButton.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient"; 
  import ConfirmDeleteModal from "$lib/components/ConfirmDeleteModal.svelte"; 
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import { tagStore } from "../../../stores/tagsStore";
  import CustomTable from "$lib/components/CustomTable.svelte";

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
{:else if tags.length > 0}
  <div class="mx-2">
   <InsertButton insertData={createTag} />
   <CustomTable items={tags} editData={editTag} {handleDelete} {tableHeaders} {currentPage} {totalPages} {previousPage} {nextPage}/>
   <ConfirmDeleteModal bind:open={openModal} on:confirm={deleteTag} />
  </div>
{:else}
  <div class="text-center py-10">
    <p>No news to display</p>
    <InsertButton insertData={createTag} />
  </div>
{/if}
