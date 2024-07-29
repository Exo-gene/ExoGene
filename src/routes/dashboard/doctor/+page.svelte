<script lang="ts">
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils"; 
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { doctorStore } from "../../../stores/doctorStore";
  import ConfirmDeleteModal from "$lib/components/ConfirmDeleteModal.svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import CustomTable from "$lib/components/CustomTable.svelte";
  import PaginationControls from "$lib/components/PaginationControls.svelte";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";
  import { authStore } from "../../../stores/Auth.Store";
  import ButtonComponent from "../../../lib/components/ButtonComponent.svelte";

  let openModal = false;
  let itemIdToDelete: number | null = null;
  let currentPage = 1;
  let totalPages = 1;
  const pageSize = 10;
  let isLoading = true;

  // Fetch initial data
  onMount(() => {
    fetchDoctorData(currentPage);
    isLoading = false;
  });

  // Function to fetch doctor for a specific page
  function fetchDoctorData(page: number) {
    currentPage = page;
    doctorStore.getDoctorData(supabase, pageSize, currentPage);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      fetchDoctorData(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      fetchDoctorData(currentPage - 1);
    }
  }

  
  // Function to delete a doctor
  function handleDelete(itemId: number) {
    itemIdToDelete = itemId;
    openModal = true;
  }
  // Function to delete a doctor
  async function deleteDoctorData() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      await doctorStore.deleteDoctorData(
        itemIdToDelete,
        supabase
      );
      itemIdToDelete = null;
      fetchDoctorData(currentPage);
    } catch (error) {
      console.error("Error deleting doctor:", error);
    } finally {
      openModal = false;
    }
  }

  function editDoctorData(doctorId: number) {
    goto(`/dashboard/doctor/${doctorId}`);
  }

  const tableHeaders = ["ID", "Created At", "Name","phoneNumber", "Action"];
  $: totalPages = Math.ceil($doctorStore[0]?.count / pageSize);
  let doctorData = $doctorStore[0]?.items;
  $: doctorData = $doctorStore[0]?.items || [];
 

  function createDoctorData() {
    goto("/dashboard/doctor/create");
  }
</script>

 <div class="max-w-screen-2xl mx-auto py-10">
  {#if isLoading}
    <div class="flex justify-center items-center">
      <LoadingIndicator />
    </div>
  {:else}
    <!-- Header Section -->
    <div class="w-full flex items-center justify-between py-4">
      <ButtonComponent title="Back" dispatch={() => goto("/dashboard/home")} />
      <h1
        class="font-bold text-center flex-grow"
        style="color: var(--titleColor);"
      >
       Doctors List
      </h1>
      <!-- insert new data -->
      {#if checkUserPolicies([Policies.CREATE_DOCTOR], $authStore)}
      <ButtonComponent title="Add" dispatch={() => createDoctorData()} />
       {/if}
    </div>

    <!-- Table data -->
  <CustomTable
      items={doctorData}
      editData={editDoctorData}
      {handleDelete}
      {tableHeaders}
      pageName="doctor"
    />
  {/if}
 <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
</div>

 <ConfirmDeleteModal
      bind:open={openModal}
      on:confirm={deleteDoctorData}
    />