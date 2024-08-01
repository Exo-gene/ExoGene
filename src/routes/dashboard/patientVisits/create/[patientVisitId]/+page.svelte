<script lang="ts">
	import { goto } from '$app/navigation';
  import { toUtc } from '$lib/utils/dateTimeFormat';
  import { v4 as uuidv4 } from 'uuid';
  import { IconUpload } from '@tabler/icons-svelte';
  import { Input } from 'flowbite-svelte';
  import { page } from '$app/stores';
  import DropdownStatuses from '$lib/components/DropdownStatuses.svelte';
  import LabDropdown from '$lib/components/LabDropdown.svelte';
  import { supabase } from '$lib/supabaseClient';
  import DropdownTests from '$lib/components/DropdownTests.svelte';
  import DropdownSampleTypes from '$lib/components/DropdownSampleTypes.svelte';
  import DoctorDropdown from '$lib/components/DoctorDropdown.svelte';
  import CustomButton from '$lib/components/CustomButton.svelte';
  import { IconPlus } from '@tabler/icons-svelte'; 
  import { Label } from 'flowbite-svelte';
 import UserProfile from '$lib/components/UserProfile.svelte';
 
  const patient_registration_id = +$page.params.patientVisitId;
  let selectedTests = new Set<number>();
  let selectedSampleTypes = new Map<number, number>();  
  let selectedLabId: number;
  let selectedDoctorId: number;
  let selectedStatusId: number;
  let registrationDate: string;
  let deadline: string;
  let files: File[] = [];
  let reports: File[] = [];
  let fileNames: string[] = [];
  let reportNames: string[] = [];

function handleFileUpload(event: Event, type: 'files' | 'reports') {
  const target = event.target as HTMLInputElement;
  const uploadedFiles = Array.from(target.files || []);

  if (type === 'files') {
    files = uploadedFiles;
    fileNames = uploadedFiles.map(file => file.name);
  } else if (type === 'reports') {
    reports = uploadedFiles;
    reportNames = uploadedFiles.map(file => file.name);
  }
}


  function getRandomString() {
    return uuidv4().split("-")[0];
  }

  async function uploadFileToSupabase(file : File, folder: string) {
    const fileExtension = file.name.split(".").pop();
    const randomPart = getRandomString();
    const fileName = `${randomPart}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from(folder)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }

    return data.path;
  }

 async function submitForm() {
  let isValid = true;
  let validationMessage = '';

  selectedSampleTypes.forEach((number, sampleTypeId) => {
    if (!sampleTypeId || !number) {
      isValid = false;
      validationMessage = 'Sample type ID and number are required.';
    }
  });

  if (!isValid) {
    alert(validationMessage);
    return;
  }

  // Upload files and reports to Supabase storage
  const fileUploadPromises = files.map(file => uploadFileToSupabase(file, 'patient_files'));
  const reportUploadPromises = reports.map(file => uploadFileToSupabase(file, 'patient_files'));

  const filesPaths = await Promise.all(fileUploadPromises);
  const reportsPaths = await Promise.all(reportUploadPromises);

 
  // Prepare payload for patient_visits
  const payload = {
    lab_id: selectedLabId,
    status_id: selectedStatusId,
    doctor_id: selectedDoctorId,
    patient_registration_id: patient_registration_id,
    registered_date: toUtc(registrationDate),
    deadline: toUtc(deadline),
    files: filesPaths,
    reports: reportsPaths
  };

  // Insert into patient_visits and get the new ID
  const { data, error: visitError } = await supabase
    .from('patient_visits')
    .insert(payload)
    .select('id')
    .single();

  if (visitError) {
    console.error('Error inserting patient visit:', visitError);
    return;
  }

  const patientVisitId = data.id;

  // Submit tests
  const insertDataTests = Array.from(selectedTests).map(testId => ({
    p_id: patientVisitId,
    t_id: testId,
  }));

  const { error: testsError } = await supabase
    .from('patient_test')
    .insert(insertDataTests);

  if (testsError) {
    console.error('Error inserting patient tests:', testsError);
  }

  // Submit sample types
  const insertDataSampleTypes = Array.from(selectedSampleTypes.entries()).map(([sampleTypeId, number]) => ({
    p_id: patientVisitId,
    s_id: sampleTypeId,
    number: number,
  }));

  const { error: sampleTypesError } = await supabase
    .from('patient_sample_type')
    .insert(insertDataSampleTypes);

  if (sampleTypesError) {
    console.error('Error inserting patient sample types:', sampleTypesError);
  }

  goto(`/dashboard/patientRegistration`);
}

</script>

<div class="max-w-screen-md mx-auto py-10">
   <UserProfile {patient_registration_id} />
  <div class="my-6" style="border: 1px solid var(--textColor);"></div> <!-- adding border -->

  <div class="grid grid-cols-2 gap-4">
    <DropdownTests patientId={patient_registration_id} bind:selectedTests />
    <DropdownSampleTypes patientId={patient_registration_id} bind:selectedSampleTypes />
    <DoctorDropdown bind:selectedDoctorId />
    <LabDropdown bind:selectedLabId />
    <DropdownStatuses bind:selectedStatusId />
  </div>

  <div class="my-6" style="border: 1px solid var(--textColor);"></div> <!-- adding border -->
 
  <div class="my-4 grid grid-cols-2 gap-4">
    <div>
      <Label class="pb-2">Registration date</Label>
      <Input type="datetime-local" bind:value={registrationDate} />
    </div>
    <div>
      <Label class="pb-2">Deadline</Label>
      <Input type="datetime-local" bind:value={deadline} />
    </div>
  </div>

  <div class="my-4 grid grid-cols-2 gap-4">
    <div>
      <Label class="pb-2">Attach files</Label>
      <div class="relative w-full hover:bg-[#D0D0D0] hover:bg-opacity-35 hover:rounded">
        <Input
          type="file"
          accept="*/*"
          multiple
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          on:change={(event) => handleFileUpload(event, "files")}
        />
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-titleColor transition duration-300">
          <IconUpload stroke={2} class="mx-auto mb-4 w-12 h-12" />
          <p>Drop your file here, or <span class="text-titleColor underline">browse</span></p>
          <p class="text-gray-500 text-sm mt-2">Supports: All types</p>
        </div>
        {#if fileNames.length > 0}
          <div class="mt-2 text-sm">
            {#each fileNames as fileName}
              <p>{fileName}</p>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    <div>
      <Label class="pb-2">Attach reports</Label>
      <div class="relative w-full hover:bg-[#D0D0D0] hover:bg-opacity-35 hover:rounded">
        <Input
          type="file"
          accept="*/*"
          multiple
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          on:change={(event) => handleFileUpload(event, "reports")}
        />
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-titleColor transition duration-300">
          <IconUpload stroke={2} class="mx-auto mb-4 w-12 h-12" />
          <p>Drop your file here, or <span class="text-titleColor underline">browse</span></p>
          <p class="text-gray-500 text-sm mt-2">Supports: All types</p>
        </div>
        {#if reportNames.length > 0}
          <div class="mt-2 text-sm">
            {#each reportNames as reportName}
              <p>{reportName}</p>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="flex justify-end">
    <CustomButton
      width="20%"
      height="3rem"
      icon={IconPlus}
      label="Add"
      on:click={submitForm}
    />
  </div>
</div>
