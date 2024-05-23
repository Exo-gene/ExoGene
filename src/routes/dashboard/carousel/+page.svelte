<script lang="ts">
	import { Policies } from './../../../lib/Models/Enums/Policies.Enum.Model.ts';
  import InsertButton from "../../../lib/components/InsertButton.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import ConfirmDeleteModal from "$lib/components/ConfirmDeleteModal.svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import { carouselStore } from "../../../stores/carouselStore";
  import CustomTable from "$lib/components/CustomTable.svelte";
  import PaginationControls from "$lib/components/PaginationControls.svelte";
  import { authStore } from "../../../stores/Auth.Store";
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils";

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
{:else}
  <div class="mx-2">
    {#if checkUserPolicies([Policies.CREATE_CAROUSEL],$authStore)}
    <InsertButton insertData={createCarousel} />
    {/if}
    <CustomTable
      items={carousel}
      editData={editCarousel}
      {handleDelete}
      {tableHeaders}
    />
    <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
    <ConfirmDeleteModal bind:open={openModal} on:confirm={deleteCarousel} />
  </div>
{/if}
