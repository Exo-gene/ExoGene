<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { IconPlus } from '@tabler/icons-svelte';
  import CustomButton from '$lib/components/CustomButton.svelte';

  let patientVisitId: number;
  let patientRegistrationId: number;
  let tests = [];
  let discount = 0;
  let cash = 0;
  let total = 0;
  let loanAmount = 0;
  let existingLoans = [];
  let cumulativeLoanAmount = 0;
  let testsInfo = '';

  onMount(async () => {
    patientVisitId = +$page.params.patientVisitId;
    await fetchPatientRegistrationId(patientVisitId);
    await fetchTests(patientVisitId);
  });

  async function fetchPatientRegistrationId(patientVisitId: number) {
    const { data, error } = await supabase
      .from('patient_visits')
      .select('patient_registration_id')
      .eq('id', patientVisitId)
      .single();

    if (error) {
      console.error('Error fetching patient registration ID:', error);
      return;
    }

    patientRegistrationId = data.patient_registration_id;
    await fetchExistingLoans(patientRegistrationId);
  }

  async function fetchExistingLoans(patientRegistrationId: number) {
    const { data, error } = await supabase
      .from('patient_loan')
      .select('*')
      .eq('p_registration_id', patientRegistrationId);

    if (error) {
      console.error('Error fetching existing loans:', error);
      return;
    }

    existingLoans = data;
    cumulativeLoanAmount = existingLoans.reduce((acc, loan) => acc + parseFloat(loan.loan_amount.replace(/,/g, '')), 0);
  }

  async function fetchTests(patientVisitId: number) {
    const { data, error } = await supabase
      .from('patient_test')
      .select('t_id')
      .eq('p_id', patientVisitId);

    if (error) {
      console.error('Error fetching tests:', error);
      return;
    }

    const testIds = data.map(test => test.t_id);
    await fetchTestPrices(testIds);
  }

  async function fetchTestPrices(testIds: number[]) {
    const { data, error } = await supabase
      .from('test')
      .select('id, name, price')
      .in('id', testIds);

    if (error) {
      console.error('Error fetching test prices:', error);
      return;
    }

    tests = data.map(test => ({
      id: test.id,
      name: test.name,
      price: Number(test.price.replace(/,/g, ''))
    }));

    testsInfo = tests.map(test => `ID: ${test.id}, Name: ${test.name}, Price: $${test.price}`).join(' | ');
    calculateTotal();
  }

  function calculateTotal() {
    const totalPrice = tests.reduce((acc, test) => acc + test.price, 0);
    total = totalPrice - discount;

    loanAmount = total + cumulativeLoanAmount > cash ? total + cumulativeLoanAmount - cash : 0;
  }

  function handleDiscountChange(event) {
    discount = +event.target.value;
    calculateTotal();
  }

  function handleCashChange(event) {
    cash = +event.target.value;
    calculateTotal();
  }

  async function handleSubmit() {
    const isPayed = loanAmount === 0;

    await saveLoan({
      patientRegistrationId,
      patientVisitId,
      loanAmount,
      discount,
      cash,
      testsInfo,
      isPayed
    });

    goto(`/dashboard/patientRegistration`);
  }

  async function saveLoan(loan) {
    try {
      const { data, error } = await supabase
        .from('patient_loan')
        .insert([
          {
            p_registration_id: loan.patientRegistrationId,
            p_visit_id: loan.patientVisitId,
            loan_amount: loan.loanAmount.toString(),
            discount: loan.discount.toString(),
            cash: loan.cash.toString(),
            tests_info: loan.testsInfo,
            is_payed: loan.isPayed,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error saving loan:', error);
      }
    } catch (error) {
      console.error('Error saving loan:', error);
    }
  }
</script>

<div class="flex items-center justify-center min-h-screen">
  <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
    <h2 class="text-2xl font-semibold mb-4 text-center">Patient Tests and Payment</h2>
    {#if tests.length > 0}
      <div class="bg-gray-200 p-4 rounded-lg mb-4">
        <h3 class="text-xl font-semibold mb-2">Tests</h3>
        <ul class="list-disc pl-6 mb-4">
          {#each tests as test}
            <li>Test ID: {test.id}, Name: {test.name}, Price: ${test.price}</li>
          {/each}
        </ul>
      </div>
      <div class="mb-4">
        <label for="discount" class="block text-sm font-medium text-gray-700">Discount</label>
        <input type="number" id="discount" bind:value={discount} on:input={handleDiscountChange} class="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
      </div>
      <div class="mb-4">
        <label for="total" class="block text-sm font-medium text-gray-700">Total</label>
        <input type="number" id="total" value={total} readonly disabled class="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
      </div>
      <div class="mb-4">
        <label for="cash" class="block text-sm font-medium text-gray-700">Cash</label>
        <input type="number" id="cash" bind:value={cash} on:input={handleCashChange} class="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
      </div>
      <div class="mb-4">
        <label for="loan" class="block text-sm font-medium text-gray-700">Loan Amount</label>
        <input type="number" id="loan" value={loanAmount} readonly disabled class="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
      </div>
        <div class="flex justify-end">
        <CustomButton
      width="20%"
      height="3rem"
      icon={IconPlus}
      label="Add"
      on:click={handleSubmit}
    />    
      
  </div>
    
   
      {:else}
      <p class="text-center text-gray-500">No tests found for this patient visit.</p>
    {/if}
  </div>
</div>

 
