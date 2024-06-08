<script lang="ts">
  import { eventStore } from "./../../../stores/eventsStore.ts";
  import InsertButton from "../../../lib/components/InsertButton.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import ConfirmDeleteModal from "$lib/components/ConfirmDeleteModal.svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import CustomTable from "$lib/components/CustomTable.svelte";
  import PaginationControls from "$lib/components/PaginationControls.svelte";
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils.js";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model.js";
  import { authStore } from "../../../stores/Auth.Store.js";

  let openModal = false;
  let itemIdToDelete: number | null = null;
  let currentPage = 1;
  let totalPages = 1;
  const pageSize = 16;
  let isLoading = true;

  // Fetch initial data
  onMount(() => {
    fetchEvent(currentPage);
    isLoading = false;
  });
  // Function to fetch events for a specific page
  function fetchEvent(page: number) {
    currentPage = page;
    eventStore.getEventData(supabase, pageSize, currentPage);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      fetchEvent(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      fetchEvent(currentPage - 1);
    }
  }

  function createEvent() {
    goto("/dashboard/events/create");
  }

  // Function to delete a event
  function handleDelete(itemId: number) {
    itemIdToDelete = itemId;
    openModal = true;
  }

  // Function to delete a event
  async function deleteEvent() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      await eventStore.deleteEventData(itemIdToDelete, supabase);
      itemIdToDelete = null;
      fetchEvent(currentPage);
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      openModal = false;
    }
  }
  function editEvent(eventId: number) {
    goto(`/dashboard/events/${eventId}`);
  }

  const tableHeaders = ["ID", "Created At", "Title", "Language", "Action"];
  $: totalPages = Math.ceil($eventStore[0]?.count / pageSize);
  let events = $eventStore[0]?.items;
  $: events = $eventStore[0]?.items || [];
</script>

{#if isLoading}
  <LoadingIndicator />
{:else}
  <div class="mx-2">
      {#if checkUserPolicies([Policies.CREATE_EVENT], $authStore)}
      <InsertButton insertData={createEvent} />
    {/if}
    <CustomTable
      items={events}
      editData={editEvent}
      {handleDelete}
      {tableHeaders}
      pageName="event"
    />
    <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
    <ConfirmDeleteModal bind:open={openModal} on:confirm={deleteEvent} />
  </div>
{/if}
