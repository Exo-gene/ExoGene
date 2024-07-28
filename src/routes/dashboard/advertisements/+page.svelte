<script lang="ts">
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils";
  import InsertButton from "../../../lib/components/ButtonComponent.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { advertisementStore } from "../../../stores/labStore";
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
    fetchAdvertisement(currentPage);
    isLoading = false;
  });

  // Function to fetch advertisements for a specific page
  function fetchAdvertisement(page: number) {
    currentPage = page;
    advertisementStore.getAdvertisementData(supabase, pageSize, currentPage);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      fetchAdvertisement(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      fetchAdvertisement(currentPage - 1);
    }
  }

  function createAdvertisement() {
    goto("/dashboard/advertisements/create");
  }

  // Function to delete a advertisement
  function handleDelete(itemId: number) {
    itemIdToDelete = itemId;
    openModal = true;
  }
  // Function to delete a advertisement
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
      fetchAdvertisement(currentPage);
    } catch (error) {
      console.error("Error deleting advertisement:", error);
    } finally {
      openModal = false;
    }
  }

  function editAdvertisement(advertisementId: number) {
    goto(`/dashboard/advertisements/${advertisementId}`);
  }

  const tableHeaders = ["ID", "Created At", "Language", "Action"];
  $: totalPages = Math.ceil($advertisementStore[0]?.count / pageSize);
  let advertisements = $advertisementStore[0]?.items;
  $: advertisements = $advertisementStore[0]?.items || [];
</script>

{#if isLoading}
  <LoadingIndicator />
{:else}
  <div class="mx-2">
    {#if checkUserPolicies([Policies.CREATE_ADVERTISEMENT], $authStore)}
      <InsertButton insertData={createAdvertisement} />
    {/if}
    <CustomTable
      items={advertisements}
      editData={editAdvertisement}
      {handleDelete}
      {tableHeaders}
      pageName="advertisement"
    />
    <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
    <ConfirmDeleteModal
      bind:open={openModal}
      on:confirm={deleteAdvertisement}
    />
  </div>
{/if}
