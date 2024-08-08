<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import CustomButton from "$lib/components/CustomButton.svelte";
  import PaginationControls from "$lib/components/PaginationControls.svelte";
  import ButtonComponent from '$lib/components/ButtonComponent.svelte';
  import { formatDateTime } from '$lib/utils/formatDateTime';
  import { IconSearch, IconX } from "@tabler/icons-svelte";
  import { goto } from "$app/navigation";
  import { writable } from 'svelte/store';
  
  // Store to manage patient registration data
  const patientRegistrationStore: any = writable({
    count: 0,
    items: []
  });

  let currentPage = 1;
  let totalPages = 1;
  const pageSize = 10;
  let isLoading = true;
  let searchPhonenumber = '';
  let searchName = '';
  let showClearButton = false;
  let notFound = false;

  onMount(() => {
    fetchData(currentPage);
  });

  async function fetchData(page) {
    currentPage = page;
    isLoading = true;

    const { data, error } = await supabase
      .rpc("get_patient_data_to_report", {
        search_phonenumber: searchPhonenumber,
        search_name: searchName,
        page_num: currentPage,
        page_size: pageSize
      });

    if (error) {
      console.error("Error fetching data:", error);
      notFound = true;
      isLoading = false;
      return;
    }

   
    // Check if data is correctly structured
    if (data && Array.isArray(data) && data.length > 0) {
      const responseData = data[0];
      patientRegistrationStore.set({
        count: responseData.count,
        items: responseData.items
      });

      totalPages = Math.ceil(responseData.count / pageSize);
      notFound = responseData.items.length === 0;
    } else {
      console.error("Unexpected data structure:", data); // Debugging statement
      notFound = true;
    }

    isLoading = false;
  }

  function nextPage() {
    if (currentPage < totalPages) {
      fetchData(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      fetchData(currentPage - 1);
    }
  }

  function handleSearch() {
    fetchData(1);
  }

  function clearSearch() {
    searchPhonenumber = '';
    searchName = '';
    fetchData(1);
  }

  $: showClearButton = searchPhonenumber !== '' || searchName !== '';

  const tableHeaders = [
    "ID",
    "Name",
    "Gender",
    "Address",
    "Birth Date",
    "Phone Number",
    "Created At",
    "Dr. Name",
    "Test Name",
    "Sample Type",
    "Registered Date",
    "Family Member Phone Number",
    "Lab",
    "Status"
  ];

  $: {
    patientRegistrationStore.subscribe(data => {
      totalPages = Math.ceil(data.count / pageSize);
    });
  }
  
  let patientRegistrationData :any= [];
  patientRegistrationStore.subscribe(data => {
    patientRegistrationData = data.items;
  });
  
  $: notFound = patientRegistrationData.length === 0;
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
        Report
      </h1>
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
                {#each patientRegistrationData as item}
                  <tr style="border-bottom: 1px solid var(--backButtonBackgroundColor);">
                    <td class="p-3">
                      <span class="flex justify-start">{item.patient_id}</span>
                    </td>
                    <td class="p-3">
                      <span class="flex justify-start">{item.patient_name}</span>
                    </td>
                    <td class="p-3">
                      <span class="flex justify-start">{item.gender}</span>
                    </td>
                    <td class="p-3">
                      <span class="flex justify-start">{item.patient_address}</span>
                    </td>
                    <td class="p-3">
                      <span class="flex justify-start">{item.birth_date}</span>
                    </td>
                    <td class="p-3">
                      <span class="flex justify-start">{item.patient_phonenumber}</span>
                    </td>
                    <td class="p-3">
                      <span class="flex justify-start"> {formatDateTime(item.patient_created_at)}</span>
                    </td>
                    <td class="p-3">
                      <span class="flex justify-start">{item.doctor_name}</span>
                    </td>
                    <td class="p-3">
                      <span class="flex justify-start">{item.test_name}</span>
                    </td>
                    <td class="p-3">
                      <span class="flex justify-start">{item.sample_type}</span>
                    </td>
                    <td class="p-3">
                      <span class="flex justify-start">{item.registered_date}</span>
                    </td>
                    <td class="p-3">
                      <span class="flex justify-start">{item.family_member_phonenumber}</span>
                    </td>
                    <td class="p-3">
                      <span class="flex justify-start">{item.lab_name}</span>
                    </td>
                    <td class="p-3">
                      <span class="flex justify-start">{item.status_name}</span>
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
