<script lang="ts">
 import { InfoCircleSolid } from 'flowbite-svelte-icons';
  import { onMount } from "svelte";
  import { Alert, Input, Label } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte"; 
  import ButtonComponent from "$lib/components/ButtonComponent.svelte";
  import CustomButton from "$lib/components/CustomButton.svelte";
  import {  IconRefresh } from "@tabler/icons-svelte";
  import { page } from "$app/stores";
  import LoadingButton from '$lib/components/LoadingButton.svelte';
  import { doctorStore } from '../../../../stores/doctorStore';

  let isLoading = false;
  let name: string = "";
  let phonenumber: string = "";
  let showToast = false;
  let nameError: string = "";
  let phonenumberError: string = "";
  let showErrorAlert = false;
  const doctorId = +$page.params.doctorId;

  // Fetch data
  onMount(async () => {
    if (doctorId) {
      isLoading = true;
      const { data, error } = await supabase
        .from("doctor")
        .select("*")
        .eq("id", doctorId)
        .single();
     
        if (error) {
        console.error("Error fetching doctor data:", error);
      } else {
        name = data.name;
        phonenumber = data.phonenumber;
      }
      isLoading = false;
    }
  });

  async function formSubmit() {
    nameError = "";
    phonenumberError = "";
    let isValid = true;
    isLoading = true;

    if (!name) {
      nameError = "Name is required";
      isValid = false;
    }

    if (!phonenumber) {
      phonenumberError = "PhoneNumber is required";
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
      const doctorObject = {
        name: name,
        phonenumber: phonenumber,
      };

      await doctorStore.updateDoctorData(doctorObject, doctorId, supabase);

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/doctor");
      }, 3000);
    } catch (error) {
      console.error("Error during doctor update:", error);
    } finally {
      isLoading = false;
    }
  }
</script>

 
  <div class="max-w-screen-2xl mx-auto py-10">
    <div class="w-full flex items-center justify-between py-4">
      <ButtonComponent title="Back" dispatch={() => history.back()} />
      <h1 class="font-bold text-center flex-grow" style="color: var(--titleColor);">
        Update Doctor Data
      </h1>
    </div>
    {#if showErrorAlert}
      <Alert style="background-color: var(--mainBackgroundColor);" color="red" class="border shadow-xl fixed top-0 right-4 z-50 w-1/4 mx-auto mt-4">
        <InfoCircleSolid slot="icon" class="w-5 h-5" />
        {#if nameError}
          <div class="text-red-500 text-sm">{nameError}</div>
        {/if}
        {#if phonenumberError}
          <div class="text-red-500 text-sm">{phonenumberError}</div>
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
              <Label style="color:var(--textColor)" for="phonenumber">PhoneNumber</Label>
            </div>
            <Input
              class="form-input px-4 py-2 rounded-md border-2 border-gray-300 flex-grow"
              type="text"
              id="phonenumber"
              bind:value={phonenumber}
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
            icon={IconRefresh}
            label="Update"
            on:click={formSubmit}
          />
            {/if}
         </div>
      </div>
    </div>
  </div>
 
{#if showToast}
  <Toast message="Doctor data has been updated successfully" type="success" />
{/if}
