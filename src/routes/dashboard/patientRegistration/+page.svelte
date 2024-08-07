<script lang="ts">
  import {  IconCalculator, IconEdit, IconEmergencyBed, IconReportMedical, IconX } from '@tabler/icons-svelte';
  import { IconSearch } from '@tabler/icons-svelte'; 
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils"; 
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { patientRegistrationStore } from "../../../stores/patientRegistrationStore";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import CustomButton from "$lib/components/CustomButton.svelte";
  import PaginationControls from "$lib/components/PaginationControls.svelte";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";
  import { authStore } from "../../../stores/Auth.Store";
  import ButtonComponent from '$lib/components/ButtonComponent.svelte';
  import { formatDateTime } from '$lib/utils/formatDateTime';

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


  
  const tableHeaders = [
    "ID",
    "Name",
     "Gender", 
     "Address",
      "Birth Date",
       "Created At",
        "Phone Number",
         "Edit Profile",
         "Add Visit",
         "Edit Visits",
         "Pay Loan"
        ];
              
  $: totalPages = Math.ceil($patientRegistrationStore[0]?.count / pageSize);
  let patientRegistrationData = $patientRegistrationStore[0]?.items;
  $: patientRegistrationData = $patientRegistrationStore[0]?.items || [];
  $: notFound = $patientRegistrationStore[0]?.status === "not found";
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


    <!-- Search Section -->
    <div class="flex justify-end mb-4 gap-2">
      <input
        type="text"
        class="border border-gray-400 px-2 py-1 rounded-md"
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

    {#if !notFound}
      <!-- Table Section -->
      <div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
        <div class="overflow-x-auto" style="background-color: var(--mainBackgroundColor); color: var(--titleColor); border: 1px solid #686868;">
          <div class="min-w-full table-responsive">
            <table class="min-w-full table-fixed">
              <thead>
                <tr>
                  {#each tableHeaders as header}
                    <th class="p-3 font-semibold uppercase bg-[#b0b0b0] text-[#012853] text-sm w-1/6">
                      <div class="flex justify-start items-start gap-2">
                        <span>{header}</span>
                      </div>
                    </th>
                  {/each}
                </tr>
              </thead>
              <tbody>
                {#each patientRegistrationData as item (item.id)}
                  <tr style="border-bottom: 1px solid var(--backButtonBackgroundColor);">
                    <td class="p-3 table-cell-bottom-border">
                      <span class="flex justify-start">{item.id}</span>
                    </td>
                    <td class="p-3 table-cell-bottom-border">
                      <span class="flex justify-start">{item.name}</span>
                    </td>
                    <td class="p-3 table-cell-bottom-border">
                      <span class="flex justify-start">{item.gender}</span>
                    </td>
                    <td class="p-3 table-cell-bottom-border">
                      <span class="flex justify-start">{item.address}</span>
                    </td>
                    <td class="p-3 table-cell-bottom-border">
                      <span class="flex justify-start">{item.birth_date}</span>
                    </td>
                    <td class="p-3 table-cell-bottom-border">
                      <span class="flex justify-start"> {formatDateTime(item.created_at.toString())}</span>
                    </td>
                    <td class="p-3 table-cell-bottom-border">
                      <span class="flex justify-start">{item.phonenumber}</span>
                    </td>
                    <td class="p-3 table-cell-bottom-border">
                      <span class="space-x-3 flex justify-end">
                        {#if checkUserPolicies([Policies[`UPDATE_PATIENTREGISTRATION`]], $authStore)}
                          <button
                            class="font-medium text-green-600 hover:underline dark:text-green-600"
                            on:click={() => editPatientRegistration(item.id)}
                          >
                            <IconEdit
                              stroke={2}
                              class="text-green-700 hover:text-green-600 transition-all"
                            />
                          </button>
                        {/if}
                      </span>
                    </td>
                    <td class="p-3 table-cell-bottom-border">
                      <span class="space-x-3 flex justify-end">
                        {#if checkUserPolicies([Policies[`READ_PATIENTVISITS`]], $authStore)}
                          <button
                            class="font-medium text-blue-600 hover:underline dark:text-blue-600"
                            on:click={() => goto("patientVisits/create/" + item.id)}
                          >
                            <IconReportMedical 
                              stroke={2}
                              class="text-blue-700 hover:text-blue-600 transition-all"
                            />
                          </button>
                        {/if}
                      </span>
                    </td>
                     <td class="p-3 table-cell-bottom-border">
                      <span class="space-x-3 flex justify-end">
                        {#if checkUserPolicies([Policies[`UPDATE_PATIENTVISITS`]], $authStore)}
                          <button
                            class="font-medium text-amber-600 hover:underline dark:text-amber-600"
                           on:click={() => goto("patientVisits/profile/" + item.id)}
                          >
                            <IconEmergencyBed  
                              stroke={2}
                              class="text-amber-700 hover:text-amber-600 transition-all"
                            />
                          </button>
                        {/if}
                      </span>
                    </td>
                    <td class="p-3 table-cell-bottom-border">
                      <span class="space-x-3 flex justify-end">
                        {#if checkUserPolicies([Policies[`UPDATE_ACCOUNTANT`]], $authStore)}
                          <button
                            class="font-medium text-orange-600 hover:underline dark:text-orange-600"
                           on:click={() => goto("accountant/loan/" + item.id)}
                          >
                            <IconCalculator 
                              stroke={2}
                              class="text-orange-700 hover:text-orange-600 transition-all"
                            />
                          </button>
                        {/if}
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
    {:else}
      <span class="flex justify-center items-center text-red-700">This data is not found</span>
    {/if}
  {/if}
</div>
