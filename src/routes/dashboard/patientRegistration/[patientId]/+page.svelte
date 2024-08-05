<script lang="ts">
  import { onMount } from 'svelte';
  import { Alert, Input, Label, Select } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte"; 
  import ButtonComponent from "$lib/components/ButtonComponent.svelte";
  import CustomButton from "$lib/components/CustomButton.svelte";
  import { IconRefresh } from "@tabler/icons-svelte";
  import { InfoCircleSolid } from "flowbite-svelte-icons";
  import LoadingButton from "$lib/components/LoadingButton.svelte";
  import { page } from "$app/stores"; 
  import { patientRegistrationStore } from '../../../../stores/patientRegistrationStore';
  import FamilyMemberDropdown from '$lib/components/FamilyMemberDropdown.svelte';

  let showToast = false;
  let showErrorAlert = false;
  let isLoading = false;
  let name = "";
  let nameError = "";
  let address = "";
  let addressError = "";
  let phonenumber = "";
  let phonenumberError = "";
  let gender = "";
  let genderError = "";
  let birth_dateError = "";
  let birthDay = "";
  let birthMonth = "";
  let birthYear = "";
  const patientRegistrationId = +$page.params.patientId;
  let familyMembersExists:any = [];
  let selectedFamilyMemberId:any = null;
  let uniqidFamilyMember:any = null;

  // Fetch data
  onMount(async () => {
    if (patientRegistrationId) {
      isLoading = true;
      const { data, error } = await supabase
        .from("patient_registration")
        .select("*")
        .eq("id", patientRegistrationId)
        .single();

      if (error) {
        console.error("Error fetching patient registration data:", error);
      } else {
        ({ name, address, gender, phonenumber, uniqid_family_member: uniqidFamilyMember } = data);
        await checkFamilyMemberExists(uniqidFamilyMember);
        if (data.birth_date) {
          const [year, month, day] = data.birth_date.split("-");
          birthYear = year;
          birthMonth = month;
          birthDay = day;
        }
      }
      isLoading = false;
    }
  });

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
    if (phonenumber.length !== 11) {
      phonenumberError = "Please, enter a valid number";
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
        id: patientRegistrationId,  
        name,
        address,
        phonenumber,
        gender,
        birth_date,
        uniqid_family_member: uniqidFamilyMember || selectedFamilyMemberId
      };

      await patientRegistrationStore.updatePatientRegistrationData(patientRegistrationObject, patientRegistrationId, supabase);

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/patientRegistration");
      }, 3000);
    } catch (error) {
      console.error("Error during patientRegistration update:", error);
    } finally {
      isLoading = false;
    }
  }

async function checkFamilyMemberExists(uniqid: string) {
  if (!uniqid) return;
  const { data: familyMembers, error: familyError } = await supabase
    .from('patient_registration')
    .select('name')
    .eq('uniqid_family_member', uniqid);
  familyMembersExists = familyMembers;
}
  // Watch for changes in the selected family member
  $: if (selectedFamilyMemberId) {
    updateUniqidForSelectedFamilyMember(selectedFamilyMemberId);
  }

  async function updateUniqidForSelectedFamilyMember(familyMemberId: number) {
    const { data: familyMember, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('id', familyMemberId)
      .single();
    if (error) {
      console.error("Error fetching family member by ID:", error);
      return;
    }
    uniqidFamilyMember = familyMember.uniqid;
  }
</script>

<div class="max-w-screen-2xl mx-auto py-10">
  <div class="w-full flex items-center justify-between py-4">
    <ButtonComponent title="Back" dispatch={() => history.back()} />
    <h1 class="font-bold text-center flex-grow" style="color: var(--titleColor);">
      Update Patient Registration 
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
       <div class="w-full flex flex-col gap-2">
        <div class="flex gap-4 items-center">
          <div class="w-28">
            <Label style="color:var(--textColor)" for="birthDay">Family Members</Label>
          </div>
            <div class="flex gap-2">
           <FamilyMemberDropdown bind:selectedFamilyMemberId />
          </div>
          {#if familyMembersExists.length > 0}
            {#each familyMembersExists as familyMember}
              <p>{familyMember.name}</p>
            {/each}
          {:else}
            <p>No family members found</p>
          {/if}
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
  <Toast message="Patient registration updated successfully" type="success" />
{/if}
