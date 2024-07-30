<script lang="ts">
  import { Alert, Input, Label, Select } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  import { patientRegistrationStore } from "../../../../stores/patientRegistrationStore"; 
  import ButtonComponent from "$lib/components/ButtonComponent.svelte";
  import CustomButton from "$lib/components/CustomButton.svelte";
  import { IconPlus } from "@tabler/icons-svelte";
  import { InfoCircleSolid } from "flowbite-svelte-icons";
  import LoadingButton from "$lib/components/LoadingButton.svelte";

  let showToast = false;
  let showErrorAlert = false;
  let isLoading = false;
  let name: string = "";
  let nameError: string = "";
  let address: string = "";
  let addressError: string = "";
  let phonenumber: string = "";
  let phonenumberError: string = "";
  let gender: string = "";
  let genderError: string = "";
  let birth_dateError: string = "";
  let birthDay: string = "";
  let birthMonth: string = "";
  let birthYear: string = "";

  async function formSubmit() {
    nameError = "";
    addressError = "";
    phonenumberError = "";
    genderError = "";
    birth_dateError = "";
    let isValid = true;
    isLoading = true;

    if (!name) {
      nameError = "Name is required";
      isValid = false;
    }

    if (!address) {
      addressError = "Address is required";
      isValid = false;
    }

    if (!phonenumber) {
      phonenumberError = "Phone number is required";
      isValid = false;
    }
    if(phonenumber.length > 11 || phonenumber.length < 11) {
      phonenumberError = "Please, Enter a valid number";
      isValid = false;
    }

    if (!gender) {
      genderError = "Gender is required";
      isValid = false;
    }

    if (!birthDay || !birthMonth || !birthYear) {
      birth_dateError = "Birth date is required";
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

    const birth_date = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;

    try {
      const patientRegistrationObject = {
        name: name,
        address: address,
        phonenumber: phonenumber,
        gender: gender,
        birth_date: birth_date
      };

      await patientRegistrationStore.insertPatientRegistrationData(patientRegistrationObject, supabase);

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/patientRegistration");
      }, 3000);
    } catch (error) {
      console.error("Error during patientRegistration insertion:", error);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="max-w-screen-2xl mx-auto py-10">
  <div class="w-full flex items-center justify-between py-4">
    <ButtonComponent title="Back" dispatch={() => history.back()} />
    <h1 class="font-bold text-center flex-grow" style="color: var(--titleColor);">
        Patient Registration 
    </h1>
  </div>
  {#if showErrorAlert}
    <Alert style="background-color: var(--mainBackgroundColor);" color="red" class="border shadow-xl fixed top-0 right-4 z-50 w-1/4 mx-auto mt-4">
      <InfoCircleSolid slot="icon" class="w-5 h-5" />
      {#if nameError}
        <div class="text-red-500 text-sm">{nameError}</div>
      {/if}
      {#if addressError}
        <div class="text-red-500 text-sm">{addressError}</div>
      {/if}
      {#if phonenumberError}
        <div class="text-red-500 text-sm">{phonenumberError}</div>
      {/if}
      {#if genderError}
        <div class="text-red-500 text-sm">{genderError}</div>
      {/if}
      {#if birth_dateError}
        <div class="text-red-500 text-sm">{birth_dateError}</div>
      {/if}
    </Alert>
  {/if}
  <div style="border: 1px solid var(--backgroundButtonColor);" class="rounded px-4 pt-10 lg:px-10 lg:pt-10 flex flex-col justify-center items-center max-w-screen-lg mx-auto">
    <div class="w-full mb-5 space-y-4">
      <div class="w-full flex flex-col gap-2">
        <div class="flex gap-4 items-center">
          <div class="w-32">
            <Label style="color:var(--textColor)" for="name">Name</Label>
          </div>
          <Input
            class="form-input px-4 py-2 rounded-md border-2 border-gray-300 flex-grow"
            type="text"
            id="name"
            bind:value={name}
          />
        </div>
      </div>
      <div class="w-full flex flex-col gap-2">
        <div class="flex gap-4 items-center">
          <div class="w-32">
            <Label style="color:var(--textColor)" for="address">Address</Label>
          </div>
          <Input
            class="form-input px-4 py-2 rounded-md border-2 border-gray-300 flex-grow"
            type="text"
            id="address"
            bind:value={address}
          />
        </div>
      </div>
      <div class="w-full flex flex-col gap-2">
        <div class="flex gap-4 items-center">
          <div class="w-32">
            <Label style="color:var(--textColor)" for="phonenumber">Phone Number</Label>
          </div>
          <Input
            class="form-input px-4 py-2 rounded-md border-2 border-gray-300 flex-grow"
            type="text"
            id="phonenumber"
            bind:value={phonenumber}
          />
        </div>
      </div>
      <div class="w-full flex flex-col gap-2">
        <div class="flex gap-4 items-center">
          <div class="w-32">
            <Label style="color:var(--textColor)" for="gender">Gender</Label>
          </div>
          <Select
            class="form-select px-4 py-2 rounded-md border-2 border-gray-300 flex-grow"
            id="gender"
            bind:value={gender}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
        </div>
      </div>
     <div class="w-full flex flex-col gap-2">
        <div class="flex gap-4 items-center">
          <div class="w-28">
            <Label style="color:var(--textColor)" for="birthDay">Birth Date</Label>
          </div>
            <div class="flex gap-2">
            <Input
              class="form-input px-4 py-2 rounded-md border-2 border-gray-300 w-16"
              type="text"
              id="birthDay"
              bind:value={birthDay}
              placeholder="DD"
              maxlength="2"
            />
            <Input
              class="form-input px-4 py-2 rounded-md border-2 border-gray-300 w-16"
              type="text"
              id="birthMonth"
              bind:value={birthMonth}
              placeholder="MM"
              maxlength="2"
            />
            <Input
              class="form-input px-4 py-2 rounded-md border-2 border-gray-300 w-24"
              type="text"
              id="birthYear"
              bind:value={birthYear}
              placeholder="YYYY"
              maxlength="4"
            />
          </div>
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
  <Toast message="New Patient has been Registered successfully" type="success" />
{/if}
