<script lang="ts">
	import { IconX } from '@tabler/icons-svelte';
	import { IconSearch } from '@tabler/icons-svelte'; 
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils"; 
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { patientRegistrationStore } from "../../../stores/patientRegistrationStore";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import CustomTable from "$lib/components/CustomTable.svelte";
  import PaginationControls from "$lib/components/PaginationControls.svelte";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";
  import { authStore } from "../../../stores/Auth.Store";
  import ButtonComponent from "../../../lib/components/ButtonComponent.svelte";
  import CustomButton from "$lib/components/CustomButton.svelte";

  let currentPage = 1;
  let totalPages = 1;
  const pageSize = 10;
  let isLoading = true;
  let searchPhonenumber = '';
  let searchName = '';
  let showClearButton = false;
  let notFound = false;
  
  onMount(() => {
    fetchPatientRegistrationData(currentPage);
    isLoading = false;
  });

  function fetchPatientRegistrationData(page: number) {
    currentPage = page;
    patientRegistrationStore.getPatientRegistrationData(
      supabase, 
      pageSize, 
      currentPage,
      searchPhonenumber,
      searchName
    );
  }
  function nextPage() {
    if (currentPage < totalPages) {
      fetchPatientRegistrationData(currentPage + 1);
    }
  }
  function previousPage() {
    if (currentPage > 1) {
      fetchPatientRegistrationData(currentPage - 1);
    }
  }
  function editPatientRegistration(patientRegistrationId: number) {
    goto(`/dashboard/patientRegistration/${patientRegistrationId}`);
  }
  function createPatientRegistration() {
    goto("/dashboard/patientRegistration/create");
  }
  function handleSearch() {
    fetchPatientRegistrationData(1);
  }
  function clearSearch() {
    searchPhonenumber = '';
    searchName = '';
    fetchPatientRegistrationData(1);
  }

   $: showClearButton = searchPhonenumber !== '' || searchName !== '';

   const tableHeaders = ["ID", "Created At", "Name","Address","phone number","Birth Date","Gender", "Action"];
  $: totalPages = Math.ceil($patientRegistrationStore[0]?.count / pageSize);
  let patientRegistrationData = $patientRegistrationStore[0]?.items;
  $: patientRegistrationData = $patientRegistrationStore[0]?.items || [];
  $:notFound =$patientRegistrationStore[0]?.status === "not found"
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
      <h1 class="font-bold text-center flex-grow" style="color: var(--titleColor);">
        PatientRegistration List
      </h1>

      
      <!-- Insert new data -->
      {#if checkUserPolicies([Policies.CREATE_PATIENTREGISTRATION], $authStore)}
        <ButtonComponent title="Add" dispatch={() => createPatientRegistration()} />
      {/if}
    </div>


       <!-- Search -->
        <div class="flex justify-end mb-4 gap-2">
         <input
          type="text"
          class="border border-gray-400 px-2 py-1 rounded-md "
          placeholder="Search by phone number"
          bind:value={searchPhonenumber}
        />
        <input
          type="text"
          class="border border-gray-400 px-2 py-1 rounded-md"
          placeholder="Search by name"
          bind:value={searchName}
        />
         <CustomButton
            width="5%"
            height="2.5rem"
            icon={IconSearch}
            label=""
            on:click={handleSearch}
          />
           {#if showClearButton}
           <CustomButton
            width="5%"
            height="2.5rem"
            icon={IconX}
            label=""
            on:click={clearSearch}
          />
       {/if}
        </div>
 
    {#if !notFound }
    <!-- Table data -->
    <CustomTable
      items={patientRegistrationData}
      editData={editPatientRegistration}
      handleDelet={""}
      {tableHeaders}
      pageName="patientRegistration"
    />
    <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
 
 {:else}
   <span class="flex justify-center items-center text-red-700"> This data is not found</span>
  {/if}

  {/if}
</div>
