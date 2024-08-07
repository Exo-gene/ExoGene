<script lang="ts">
  import { onMount } from "svelte";
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabaseClient';
  import { toLocaleDateFormat, toUtc } from "$lib/utils/dateTimeFormat";
  import { Badge, Button, Input } from "flowbite-svelte";
  import { goto } from "$app/navigation";
  import ButtonComponent from "$lib/components/ButtonComponent.svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";

  let patientRegistrationId: number;
  let loans: any = [];
  let payments: any = [];
 let isLoading = true;

  onMount(async () => {
    patientRegistrationId = +$page.params.patientRegistrationId;
    await fetchData();
  });

  async function fetchData() {
    try {
        isLoading = false;
      const { data: paymentData, error: paymentError } = await supabase
        .from('patient_payment')
        .select('*')
        .eq('p_registration_id', patientRegistrationId);

      if (paymentError) {
        console.error('Error fetching payments:', paymentError);
        return;
      }

      payments = paymentData;

      const paymentIds = payments.map(payment => payment.id);
      const { data: loanData, error: loanError } = await supabase
        .from('patient_loan')
        .select('*')
        .in('p_payment', paymentIds);

      if (loanError) {
        console.error('Error fetching loans:', loanError);
        return;
      }

      loans = loanData;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function handlePaymentSubmit(paymentId: number, loanAmount: number, payAmount: number) {
    const newAmount = loanAmount - payAmount;
    const isPayed = newAmount <= 0;
    const updatedFields = {
      amount: newAmount.toString(),
      payed: isPayed ? 'true' : 'false',
      created_at: toUtc(new Date().toISOString()),
    };

    try {
      const { error } = await supabase
        .from('patient_loan')
        .update(updatedFields)
        .eq('p_payment', paymentId);

      if (error) {
        console.error('Error updating loan amount:', error);
      } else {
        // Refresh data to reflect the updated loan amount
        await fetchData();
        history.back();
      }
    } catch (error) {
      console.error('Error updating loan:', error);
    }
  }

  const tableHeaders = [
    "ID",
    "Created At",
    "Registration ID",
    "Visit ID", 
    "Tests Info",
    "Discount",
    "Cash",
    "Total Test Price",
    "Loan",
    "Pay Loan", 
  ];
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
       Patient Payment & Loans
      </h1>
    </div>


 

 
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
         {#each payments as payment}
          <tr style="border-bottom: 1px solid var(--backButtonBackgroundColor);">
           <td class="p-3 table-cell-bottom-border">{payment.id}</td>
           <td class="p-3 table-cell-bottom-border">{toLocaleDateFormat(payment.created_at)}</td>
           <td class="p-3 table-cell-bottom-border">{payment.p_registration_id}</td>
           <td class="p-3 table-cell-bottom-border">{payment.p_visit_id}</td>
           <td class="p-3 table-cell-bottom-border">{payment.tests_info}</td>
           <td class="p-3 table-cell-bottom-border">{payment.discount}</td>
           <td class="p-3 table-cell-bottom-border">
            <Badge large color="green">
            {payment.cash}
           </Badge></td>
            <td class="p-3 table-cell-bottom-border">{payment.total_test_price}</td>
           <td class="p-3 table-cell-bottom-border">
            {#if loans.find(loan => loan.p_payment === payment.id)}
              {#each loans.filter(loan => loan.p_payment === payment.id) as loan}
                <Badge large color="red">{loan.amount}</Badge>
              {/each}
            {/if}
          </td>
           <td class="p-3 table-cell-bottom-border">
            <div class="flex justify-center gap-2">
              {#if payment.is_payed === 'false'}
                <Input class="w-24" type="number" min="0" max={parseFloat(loans.find(loan => loan.p_payment === payment.id)?.amount || 0)} bind:value={payment.payAmount} />
                <Button on:click={() => handlePaymentSubmit(payment.id, parseFloat(loans.find(loan => loan.p_payment === payment.id)?.amount || 0), payment.payAmount)}>Add</Button>
              {/if}
            </div>
          </td>
        </tr>
      {/each}
              </tbody>

              
            </table>
          </div>
        </div>
      </div>
     
  {/if}
</div>
