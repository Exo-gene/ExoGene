<script lang="ts">
  import { InfoCircleSolid } from 'flowbite-svelte-icons';
  import { onMount } from "svelte";
  import { Alert, Checkbox, Input, Label } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte"; 
  import ButtonComponent from "$lib/components/ButtonComponent.svelte";
  import { IconRefresh } from "@tabler/icons-svelte";
  import { page } from "$app/stores";
  import LoadingButton from '$lib/components/LoadingButton.svelte';
  import { statusStore } from '../../../../stores/statusStore';
  import CustomButton from '$lib/components/CustomButton.svelte';
  import { roleStore } from "../../../../stores/Role.Store";
  import { authStore } from '../../../../stores/Auth.Store';

  let isLoading = false;
  let name: string = ""; 
  let isDefault: boolean = false; 
  let showToast = false;
  let nameError: string = ""; 
  let showErrorAlert = false;
  const statusId = +$page.params.statusId;

  // Fetch data
  onMount(async () => { 
    if (statusId) {
      isLoading = true;
      const { data, error } = await supabase
        .from("status")
        .select("*")
        .eq("id", statusId)
        .is("deleted_at", null)
        .single();
    
      if (error) {
        console.error("Error fetching status data:", error);
      } else {
        name = data.name;
        isDefault = data.is_default === "true";
      }
      isLoading = false;
    }
  });

  async function formSubmit() {
    nameError = "";
    let isValid = true;
    isLoading = true;

    if (!name) {
      nameError = "Name is required";
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
      const statusObject = {
        name: name,
        is_default: isDefault,
      };

      if (isDefault) {
        // Set all other statuses to not default
        await supabase
          .from("status")
          .update({ is_default: false })
          .neq("id", statusId);
      }

      await statusStore.updateStatusData(statusObject, statusId, supabase);

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/status");
      }, 3000);
    } catch (error) {
      console.error("Error during status update:", error);
    } finally {
      isLoading = false;
    }
  }

  function toggleDefault() {
    isDefault = !isDefault;
  }

</script>

<div class="max-w-screen-2xl mx-auto py-10">
  <div class="w-full flex items-center justify-between py-4">
    <ButtonComponent title="Back" dispatch={() => history.back()} />
    <h1 class="font-bold text-center flex-grow" style="color: var(--titleColor);">
      Update status Data
    </h1>
  </div>
  {#if showErrorAlert}
    <Alert style="background-color: var(--mainBackgroundColor);" color="red" class="border shadow-xl fixed top-0 right-4 z-50 w-1/4 mx-auto mt-4">
      <InfoCircleSolid slot="icon" class="w-5 h-5" />
      {#if nameError}
        <div class="text-red-500 text-sm">{nameError}</div>
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
        {#if $authStore?.roles?.map((role) => role.name).includes("SuperAdmin")}
        <div class="flex items-center">
          <div class="w-32">
            <Label style="color:var(--textColor)" for="default">Default</Label>
          </div>
          <Checkbox 
           color="green"
           class="p-2"
            bind:checked={isDefault}
            on:click={toggleDefault}
          />
        </div>
        {/if}
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
  <Toast message="Status data has been updated successfully" type="success" />
{/if}
