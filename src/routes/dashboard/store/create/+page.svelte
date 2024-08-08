<script lang="ts">
	import { toUtc } from '$lib/utils/dateTimeFormat';
  import { Alert, Input, Label } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  import { storeDataStore } from "../../../../stores/storeDataStore"; 
  import ButtonComponent from "$lib/components/ButtonComponent.svelte";
  import CustomButton from "$lib/components/CustomButton.svelte";
  import { IconPlus } from "@tabler/icons-svelte";
  import { InfoCircleSolid } from "flowbite-svelte-icons";
  import LoadingButton from "$lib/components/LoadingButton.svelte";
  import CompanyDropdown from '$lib/components/companyDropdown.svelte';

  let isLoading = false;
  let showToast = false;
  let showErrorAlert = false;
  let company_nameError: string = "";
  let amount: string = "";
  let amountError: string = "";
  let lot_number: string = "";
  let lot_numberError: string = "";
  let item_name: string = "";
  let item_nameError: string = "";
  let registered_date: string = "";
  let registered_dateError: string = "";
  let expiration_date: string = "";
  let expiration_dateError: string = "";
  let selectedCompanyId: number;

  async function formSubmit() {
    company_nameError = "";
    amountError = "";
    lot_numberError = "";
    item_nameError = "";
    registered_dateError = "";
    expiration_dateError = "";
    
    let isValid = true;
    isLoading = true;

    if (!selectedCompanyId) {
      company_nameError = "Company Name is required";
      isValid = false;
    }

    if (!amount) {
      amountError = "Amount is required";
      isValid = false;
    }

    if (!lot_number) {
      lot_numberError = "Lot Number is required";
      isValid = false;
    }

    if (!item_name) {
      item_nameError = "Item Name is required";
      isValid = false;
    }

    if (!registered_date) {
      registered_dateError = "Registered Date is required";
      isValid = false;
    }

    if (!expiration_date) {
      expiration_dateError = "Expiration Date is required";
      isValid = false;
    }

    if (!isValid) {
      isLoading = false;
      showErrorAlert = true;
      setTimeout(() => {
        showErrorAlert = false;
      }, 3000);
      return;
    }

    try {
      const storeObject = {
        company_id: selectedCompanyId,
        amount: amount,
        lot_number: lot_number,
        item_name: item_name,
        registered_date: toUtc(registered_date),
        expiration_date: toUtc(expiration_date),
      };

      await storeDataStore.insertStoreData(storeObject, supabase);

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/store");
      }, 3000);
    } catch (error) {
      console.error("Error during store insertion:", error);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="max-w-screen-2xl mx-auto py-10">
  <div class="w-full flex items-center justify-between py-4">
    <ButtonComponent title="Back" dispatch={() => history.back()} />
    <h1 class="font-bold text-center flex-grow" style="color: var(--titleColor);">
      Create Store Data
    </h1>
  </div>
  {#if showErrorAlert}
    <Alert style="background-color: var(--mainBackgroundColor);" color="red" class="border shadow-xl fixed top-0 right-4 z-50 w-1/4 mx-auto mt-4">
      <InfoCircleSolid slot="icon" class="w-5 h-5" />
      {#if company_nameError}
        <div class="text-red-500 text-sm">{company_nameError}</div>
      {/if}
      {#if amountError}
        <div class="text-red-500 text-sm">{amountError}</div>
      {/if}
      {#if lot_numberError}
        <div class="text-red-500 text-sm">{lot_numberError}</div>
      {/if}
      {#if item_nameError}
        <div class="text-red-500 text-sm">{item_nameError}</div>
      {/if}
      {#if registered_dateError}
        <div class="text-red-500 text-sm">{registered_dateError}</div>
      {/if}
      {#if expiration_dateError}
        <div class="text-red-500 text-sm">{expiration_dateError}</div>
      {/if}
    </Alert>
  {/if}
  <div style="border: 1px solid var(--backgroundButtonColor);" class="rounded px-4 pt-10 lg:px-10 lg:pt-10 flex flex-col justify-center items-center max-w-screen-lg mx-auto">
    <div class="w-full mb-5 space-y-4">
      <div class="w-full flex flex-col gap-2">
        <div class="flex gap-4 items-center">
          <div class="w-32">
            <Label style="color:var(--textColor)" for="company_name">Name</Label>
          </div>
          <CompanyDropdown bind:selectedCompanyId />
        </div>
      </div>
      <div class="w-full flex flex-col gap-2">
        <div class="flex gap-4 items-center">
          <div class="w-32">
            <Label style="color:var(--textColor)" for="amount">Amount</Label>
          </div>
          <Input
            class="form-input px-4 py-2 rounded-md border-2 border-gray-300 flex-grow"
            type="number"
            id="amount"
            bind:value={amount}
          />
        </div>
      </div>
      <div class="w-full flex flex-col gap-2">
        <div class="flex gap-4 items-center">
          <div class="w-32">
            <Label style="color:var(--textColor)" for="lot_number">Lot Number</Label>
          </div>
          <Input
            class="form-input px-4 py-2 rounded-md border-2 border-gray-300 flex-grow"
            type="number"
            id="lot_number"
            bind:value={lot_number}
          />
        </div>
      </div>
      <div class="w-full flex flex-col gap-2">
        <div class="flex gap-4 items-center">
          <div class="w-32">
            <Label style="color:var(--textColor)" for="item_name">Item Name</Label>
          </div>
          <Input
            class="form-input px-4 py-2 rounded-md border-2 border-gray-300 flex-grow"
            type="text"
            id="item_name"
            bind:value={item_name}
          />
        </div>
      </div>
      <div class="w-full flex flex-col gap-2">
        <div class="flex gap-4 items-center">
          <div class="w-32">
            <Label style="color:var(--textColor)" for="registered_date">Registered Date</Label>
          </div>
          <Input
            class="form-input px-4 py-2 rounded-md border-2 border-gray-300 flex-grow"
            type="date"
            id="registered_date"
            bind:value={registered_date}
          />
        </div>
      </div>
      <div class="w-full flex flex-col gap-2">
        <div class="flex gap-4 items-center">
          <div class="w-32">
            <Label style="color:var(--textColor)" for="expiration_date">Expiration Date</Label>
          </div>
          <Input
            class="form-input px-4 py-2 rounded-md border-2 border-gray-300 flex-grow"
            type="date"
            id="expiration_date"
            bind:value={expiration_date}
          />
        </div>
      </div>
      <div class="flex justify-end mt-4">
        {#if isLoading}   
          <LoadingButton isLoading={isLoading}/>
        {:else}
          <CustomButton
            width="20%"
            height="3rem"
            icon={IconPlus}
            label="Add"
            on:click={formSubmit}
          />
        {/if}
      </div>
    </div>
  </div>
</div>
 


{#if showToast}
  <Toast message="New store has been inserted successfully" type="success" />
{/if}

