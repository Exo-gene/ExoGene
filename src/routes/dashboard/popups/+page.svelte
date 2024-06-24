<script lang="ts">
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils";
  import InsertButton from "../../../lib/components/InsertButton.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { popupsStore } from "../../../stores/popupsStore";
  import ConfirmDeleteModal from "$lib/components/ConfirmDeleteModal.svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import CustomTable from "$lib/components/CustomTable.svelte";
  import PaginationControls from "$lib/components/PaginationControls.svelte";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";
  import { authStore } from "../../../stores/Auth.Store";

  let openModal = false;
  let itemIdToDelete: number | null = null;
  let currentPage = 1;
  let totalPages = 1;
  const pageSize = 3;
  let isLoading = true;

  // Fetch initial data
  onMount(() => {
    fetchPopups(currentPage);
    isLoading = false;
  });

  // Function to fetch popups for a specific page
  function fetchPopups(page: number) {
    currentPage = page;
    popupsStore.getPopupsData(supabase, pageSize, currentPage);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      fetchPopups(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      fetchPopups(currentPage - 1);
    }
  }

  function createPopups() {
    goto("/dashboard/popups/create");
  }

  // Function to delete a popups
  function handleDelete(itemId: number) {
    itemIdToDelete = itemId;
    openModal = true;
  }

  // Function to delete a popups
  async function deletePopups() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      await popupsStore.deletePopupsData(itemIdToDelete, supabase);
      itemIdToDelete = null;
      fetchPopups(currentPage);
    } catch (error) {
      console.error("Error deleting popups:", error);
    } finally {
      openModal = false;
    }
  }

  function editPopups(popupId: number) {
    goto(`/dashboard/popups/${popupId}`);
  }

  const tableHeaders = ["ID", "Created At", "Language", "Action"];
  $: totalPages = Math.ceil($popupsStore[0]?.count / pageSize);
  let popups = $popupsStore[0]?.items;
  $: popups = $popupsStore[0]?.items || [];
</script>

{#if isLoading}
  <LoadingIndicator />
{:else}
  <div class="mx-2">
    {#if checkUserPolicies([Policies.CREATE_POPUPS], $authStore)}
      <InsertButton insertData={createPopups} />
    {/if}
    <CustomTable
      items={popups}
      editData={editPopups}
      {handleDelete}
      {tableHeaders}
      pageName="popups"
    />
    <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
    <ConfirmDeleteModal bind:open={openModal} on:confirm={deletePopups} />
  </div>
{/if}
