<script lang="ts">
	import { authStore } from './../../../stores/Auth.Store.ts';
  import InsertButton from "../../../lib/components/ButtonComponent.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { newsStore } from "../../../stores/newsStore";
  import ConfirmDeleteModal from "$lib/components/ConfirmDeleteModal.svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import CustomTable from "$lib/components/CustomTable.svelte";
  import PaginationControls from "$lib/components/PaginationControls.svelte";
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";

  let openModal = false;
  let itemIdToDelete: number | null = null;
  let currentPage = 1;
  let totalPages = 1;
  const pageSize = 16;
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
{:else}
  <div class="mx-2">
      {#if checkUserPolicies([Policies.CREATE_NEWS], $authStore)}
      <InsertButton insertData={createNews} />
    {/if}
    <CustomTable
      items={news}
      editData={editNews}
      {handleDelete}
      {tableHeaders}
      pageName="news"
    />
    <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
    <ConfirmDeleteModal bind:open={openModal} on:confirm={deleteNews} />
  </div>
{/if}
