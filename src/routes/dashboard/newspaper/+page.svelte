<script lang="ts">
  import { Policies } from "./../../../lib/Models/Enums/Policies.Enum.Model";
  import InsertButton from "../../../lib/components/InsertButton.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import ConfirmDeleteModal from "$lib/components/ConfirmDeleteModal.svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import { newspaperStore } from "../../../stores/newspaperStore";
  import CustomTable from "$lib/components/CustomTable.svelte";
  import PaginationControls from "$lib/components/PaginationControls.svelte";
  import { authStore } from "../../../stores/Auth.Store";
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils";

  let openModal = false;
  let itemIdToDelete: number | null = null;
  let currentPage = 1;
  let totalPages = 1;
  const pageSize = 10;
  let isLoading = true;

  // Fetch initial data
  onMount(() => {
    fetchCategories(currentPage);
    isLoading = false;
  });

  // Function to fetch categories for a specific page
  function fetchCategories(page: number) {
    currentPage = page;
    newspaperStore.getNewspaperData(supabase, pageSize, currentPage);
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

  function createNewspaper() {
    goto("/dashboard/newspaper/create");
  }

  // Function to delete a category
  function handleDelete(itemId: number) {
    itemIdToDelete = itemId;
    openModal = true;
  }
  // Function to delete a category
  async function deleteNewspaper() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      await newspaperStore.deleteNewspaperData(itemIdToDelete, supabase);
      itemIdToDelete = null;
      fetchCategories(currentPage);
    } catch (error) {
      console.error("Error deleting newspaper:", error);
    } finally {
      openModal = false;
    }
  }

  function editNewspaper(newspaperId: number) {
    goto(`/dashboard/newspaper/${newspaperId}`);
  }

  const tableHeaders = ["ID", "Created At", "Language", "Number", "Action"];
  $: totalPages = Math.ceil($newspaperStore[0]?.count / pageSize);
  let newspaper = $newspaperStore[0]?.items;
  $: newspaper = $newspaperStore[0]?.items;
</script>

{#if isLoading}
  <LoadingIndicator />
{:else}
  <div class="mx-2">
    {#if checkUserPolicies([Policies.CREATE_NEWSPAPER], $authStore)}
      <InsertButton insertData={createNewspaper} />
    {/if}
    <CustomTable
      items={newspaper}
      editData={editNewspaper}
      {handleDelete}
      {tableHeaders}
      pageName="newspaper"
    />
    <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
    <ConfirmDeleteModal bind:open={openModal} on:confirm={deleteNewspaper} />
  </div>
{/if}
