<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import PaginationControls from '$lib/components/PaginationControls.svelte';
  import ButtonComponent from '$lib/components/ButtonComponent.svelte';
  import { formatDateTime } from '$lib/utils/formatDateTime';
  import CustomButton from '$lib/components/CustomButton.svelte';
  import { IconSearch, IconX } from '@tabler/icons-svelte';

  interface PatientPayment {
    id: number;
    created_at: string;
    loan_amount: string;
    is_payed: boolean;
    tests_info: string;
    patient_name: string;
  }

  let isLoading: boolean = true;
  let patientPaymentData: PatientPayment[] = [];
  let currentPage: number = 1;
  let totalPages: number = 1;
  const pageSize: number = 10;
  let searchPayed: string = '';
  let searchName: string = '';
  const tableHeaders: string[] = ["ID", "Created At", "Patient Name", "Loan Amount", "Payed", "Tests Info"];

  onMount(() => {
    fetchData();
  });

  async function fetchData() {
    isLoading = true;

    const { data, error } = await supabase
      .rpc('get_patient_payment', {
        page_num: currentPage,
        page_size: pageSize,
        search_name: searchName || null,
        search_payed: searchPayed !== '' ? (searchPayed === 'true') : null
      });

    if (error) {
      console.error('Error fetching patient payment data:', error);
      isLoading = false;
      return;
    }

    const result = data as {
      count: number;
      page: number;
      page_limit: number;
      remainingitems: number;
      items: PatientPayment[];
    };

    patientPaymentData = result.items;
    totalPages = Math.ceil(result.count / pageSize);
    isLoading = false;
  }

  function nextPage() {
    if (currentPage < totalPages) {
      currentPage++;
      fetchData();
    }
  }

  function previousPage() {
    if (currentPage > 1) {
      currentPage--;
      fetchData();
    }
  }

  function handleSearch() {
    currentPage = 1;
    fetchData();
  }

  function clearSearch() {
    searchPayed = '';
    searchName = '';
    currentPage = 1;
    fetchData();
  }

  $: showClearButton = searchPayed !== '' || searchName !== '';
</script>

<div class="max-w-screen-2xl mx-auto py-10">
  {#if isLoading}
    <div class="flex justify-center items-center">
      <div class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  {:else}
    <div class="w-full flex items-center justify-between py-4">
      <ButtonComponent title="Back" dispatch={() => goto("/dashboard/home")} />
      <h1 class="font-bold text-center flex-grow" style="color: var(--titleColor);">
        Patient Loan List
      </h1>
    </div>

    <!-- Search Section -->
    <div class="flex justify-end mb-4 gap-2">
      <select
        class="border border-gray-400 px-2 py-1 rounded-md"
        bind:value={searchPayed}
      >
        <option value="">All</option>
        <option value="true">Paid</option>
        <option value="false">Unpaid</option>
      </select>
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

    <div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
      <div class="overflow-x-auto bg-white rounded-lg">
        <table class="min-w-full table-fixed">
          <thead>
            <tr>
              {#each tableHeaders as header}
                <th class="p-3 font-semibold uppercase bg-gray-200 text-gray-700 text-sm w-1/6">
                  <div class="flex justify-start items-start gap-2">
                    <span>{header}</span>
                  </div>
                </th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each patientPaymentData as item (item.id)}
              <tr class="border-b border-gray-200">
                <td class="p-3">{item.id}</td>
                <td class="p-3">{formatDateTime(item.created_at)}</td>
                <td class="p-3">{item.patient_name}</td>
                <td class="p-3">{item.loan_amount}</td>
                <td class="p-3">{item.is_payed}</td>
                <td class="p-3">{item.tests_info}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
    </div>
  {/if}
</div>

<style>
  .spinner-border {
    border-top-color: transparent;
  }
</style>
