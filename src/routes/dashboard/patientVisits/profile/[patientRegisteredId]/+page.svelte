<script lang="ts">
  import { IconEdit, IconX, IconSearch, IconCalculator } from '@tabler/icons-svelte'; 
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils"; 
  import { goto } from "$app/navigation";
  import { onMount } from "svelte"; 
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import PaginationControls from "$lib/components/PaginationControls.svelte";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";
  import ButtonComponent from '$lib/components/ButtonComponent.svelte';
  import { formatDateTime } from '$lib/utils/formatDateTime';
  import { authStore } from '../../../../../stores/Auth.Store';
  import { page } from "$app/stores";
  import { supabase } from '$lib/supabaseClient';

  let currentPage = 1;
  let totalPages = 1;
  const pageSize = 10;
  let isLoading = true;
  let notFound = false;
  let patientVisitsData :any= [];
  let patientRegisteredId = +$page.params.patientRegisteredId;

  onMount(() => {
    fetchPatientVisitsData(currentPage);
    isLoading = false;
  });

  async function fetchPatientVisits(registeredId: number, page: number, pageSize: number) {
    const { data, error } = await supabase
      .rpc('get_paginated_patient_visits_depend_registered_id_data', {
        registered_id: registeredId,
        page_num: page,
        page_size: pageSize
      });
 
  
    if (error) {
      console.error('Error fetching patient visits:', error);
      return { data: [], count: 0, page: 1, page_limit: pageSize, remaining_items: 0 };
    }

    return {
      data: data[0].items,
      count: data[0].count,
      page: data[0].page,
      page_limit: data[0].page_limit,
      remaining_items: data[0].remaining_items
    };
  }

  async function fetchPatientVisitsData(page: number) {
    isLoading = true;
    
    const result = await fetchPatientVisits(patientRegisteredId, page, pageSize);
    
    patientVisitsData = result.data;
 
    
    totalPages = Math.ceil(result.count / pageSize);
    currentPage = result.page;
    notFound = patientVisitsData.length === 0;
    
    isLoading = false;
  }

  function nextPage() {
    if (currentPage < totalPages) {
      fetchPatientVisitsData(currentPage + 1);
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      fetchPatientVisitsData(currentPage - 1);
    }
  }

  function editPatientVisit(patientVisitId: number) {
    goto(`/dashboard/patientVisits/edit/${patientVisitId}`);
  }

  const tableHeaders = [
    "ID",
    "Lab Name",
    "Doctor Name",
    "Status Name",
    "Registered",
    "Deadline",
    "Edit",
    "Accountant"
  ];

    function getStatusClass(statusName: string): string {
    switch (statusName.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-400';
      case 'accept':
        return 'bg-green-400';
      case 'reject':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
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
      <ButtonComponent title="Back" dispatch={() => goto("/dashboard/patientRegistration")} />
      <h1 class="font-bold text-center flex-grow" style="color: var(--titleColor);">
        Patient Visits List
      </h1>
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
                    <th class="p-3 font-semibold uppercase bg-[#b0b0b0] text-[#012853] text-sm">
                      <div class="flex justify-start items-start gap-2">
                        <span>{header}</span>
                      </div>
                    </th>
                  {/each}
                </tr>
              </thead>
              <tbody>
                {#each patientVisitsData as item (item.id)}
                  <tr style="border-bottom: 1px solid var(--backButtonBackgroundColor);">
                    <td class="p-3 table-cell-bottom-border">
                      <span class="flex justify-start">{item.id}</span>
                    </td>
                   <td class="p-3 table-cell-bottom-border">
                      <span class="flex justify-start">{item.lab_name}</span>
                    </td>
                    <td class="p-3 table-cell-bottom-border">
                      <span class="flex justify-start">{item.doctor_name}</span>
                    </td>
                    <td class="p-3 table-cell-bottom-border">
                 <span class="flex justify-center p-1 rounded-xl {getStatusClass(item.status_name)}">{item.status_name}</span>
                   </td>
                       <td class="p-3 table-cell-bottom-border">
                      <span class="flex justify-start">{formatDateTime(item.registered_date)}</span>
                    </td>
                    <td class="p-3 table-cell-bottom-border">
                      <span class="flex justify-start">{formatDateTime(item.deadline)}</span>
                    </td>
                     <td class="p-3 table-cell-bottom-border">
                      {#if checkUserPolicies([Policies[`UPDATE_PATIENTVISITS`]], $authStore)}
                          <button
                            class="font-medium text-green-600 hover:underline dark:text-green-600"
                            on:click={() => editPatientVisit(item.id)}
                          >
                            <IconEdit
                              stroke={2}
                              class="text-green-700 hover:text-green-600 transition-all"
                            />
                          </button>
                        {/if}
                    </td>
                        <td class="p-3 table-cell-bottom-border">
                      <span class="space-x-3 flex justify-end">
                        {#if checkUserPolicies([Policies[`READ_ACCOUNTANT`]], $authStore)}
                          <button
                            class="font-medium text-purple-600 hover:underline dark:text-purple-600"
                            on:click={() => goto(`/dashboard/accountant/${item.id}`, { replaceState: true })}
                          >
                            <IconCalculator  
                              stroke={2}
                              class="text-purple-700 hover:text-purple-600 transition-all"
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



<style>
  .table-header {
    text-align: left;
  }

  .table-cell-bottom-border {
    border-bottom: 1px solid #e5e7eb;
  }
</style>
