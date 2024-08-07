<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { IconPlus } from '@tabler/icons-svelte';
  import CustomButton from '$lib/components/CustomButton.svelte';

  interface Test {
    id: number;
    name: string;
    price: number;
  }

  interface Loan {
    id: number;
    amount: string;
  }

  let patientVisitId: number;
  let patientRegistrationId: number;
  let tests: Test[] = [];
  let discount: number = 0;
  let cash: number = 0;
  let total: number = 0;
  let existingLoans: Loan[] = [];
  let cumulativeLoanAmount: number = 0;
  let testsInfo: string = '';
  let totalTestPrice: number = 0;
  let isPayed: boolean = false;

  onMount(async () => {
    patientVisitId = +$page.params.patientVisitId;
    await fetchPatientRegistrationId(patientVisitId);
    await fetchTests(patientVisitId);
    calculateTotal();
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
      .from('patient_payment')
      .select('*')
      .eq('p_registration_id', patientRegistrationId);

    if (error) {
      console.error('Error fetching existing loans:', error);
      return;
    }
    existingLoans = data;
    cumulativeLoanAmount = existingLoans.reduce((acc, loan) => {
      if (loan.amount) {
        return acc + parseFloat(loan.amount.replace(/,/g, ''));
      }
      return acc;
    }, 0);
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

    testsInfo = tests.map(test => `ID: ${test.id}, Name: ${test.name}, Price: ${test.price}`).join(' | ');
    totalTestPrice = tests.reduce((acc, test) => acc + test.price, 0);
    calculateTotal();
  }

  function calculateTotal() {
    const totalPrice = tests.reduce((acc, test) => acc + test.price, 0);
    total = totalPrice - discount;

    if (cash >= total) {
      isPayed = true;
      cumulativeLoanAmount = 0;
    } else {
      isPayed = false;
      cumulativeLoanAmount = total - cash;
    }
  }

  function handleDiscountChange(event: Event) {
    discount = +(event.target as HTMLInputElement).value;
    calculateTotal();
  }

  function handleCashChange(event: Event) {
    cash = +(event.target as HTMLInputElement).value;
    calculateTotal();
  }

  async function handleSubmit() {
    const paymentId = await savePayment({
      patientRegistrationId,
      patientVisitId,
      discount,
      cash,
      testsInfo,
      totalTestPrice,
      isPayed
    });

    if (!isPayed && paymentId) {
      await saveLoan({
        patientRegistrationId,
        amount: cumulativeLoanAmount.toString(),
        p_payment: paymentId
      });
    }

    goto(`/dashboard/patientRegistration`);
  }

  interface SavePaymentInput {
    patientRegistrationId: number;
    patientVisitId: number;
    discount: number;
    cash: number;
    testsInfo: string;
    totalTestPrice: number;
    isPayed: boolean;
  }

  interface SaveLoanInput {
    patientRegistrationId: number;
    amount: string;
    p_payment: number | null;
  }

  async function savePayment(payment: SavePaymentInput): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('patient_payment')
        .insert([
          {
            p_registration_id: payment.patientRegistrationId,
            p_visit_id: payment.patientVisitId,
            discount: payment.discount.toString(),
            cash: payment.cash.toString(),
            tests_info: payment.testsInfo,
            total_test_price: payment.totalTestPrice.toString(),
            is_payed: payment.isPayed,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error saving payment:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error saving payment:', error);
      return null;
    }
  }

  async function saveLoan(loan: SaveLoanInput) {
    try {
      const { data, error } = await supabase
        .from('patient_loan')
        .insert([
          {
            p_payment: loan.p_payment,
            amount: loan.amount,
            payed: 'false'
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
        <input type="number" id="loan" value={cumulativeLoanAmount} readonly disabled class="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
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

<style>
  .spinner-border {
    border-top-color: transparent;
  }
</style>
