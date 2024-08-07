<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from "$app/stores";
  import { supabase } from '$lib/supabaseClient';
  import { toUtc, toLocaleDateFormat } from '$lib/utils/dateTimeFormat';
  import { v4 as uuidv4 } from 'uuid';
  import { IconUpload, IconX } from '@tabler/icons-svelte';
  import { Input } from 'flowbite-svelte';
  import DropdownStatuses from '$lib/components/DropdownStatuses.svelte';
  import LabDropdown from '$lib/components/LabDropdown.svelte';
  import DropdownTests from '$lib/components/DropdownTests.svelte';
  import DropdownSampleTypes from '$lib/components/DropdownSampleTypes.svelte';
  import DoctorDropdown from '$lib/components/DoctorDropdown.svelte';
  import CustomButton from '$lib/components/CustomButton.svelte';
  import { IconPlus } from '@tabler/icons-svelte'; 
  import { Label } from 'flowbite-svelte';
  import UserProfile from '$lib/components/UserProfile.svelte';

  const patientVisitId = +$page.params.patientVisitId;
  let patient_registration_id: number;
  let selectedTests = new Set<number>();
  let selectedSampleTypes = new Map<number, number>();  
  let selectedLabId: number;
  let selectedDoctorId: number;
  let selectedStatusId: number;
  let registrationDate: string;
  let deadline: string;
  let files: { file: File; randomName: string }[] = [];
  let reports: { file: File; randomName: string }[] = [];
  let fileNames: string[] = [];
  let reportNames: string[] = [];
  let removedFiles: string[] = [];
  let removedReports: string[] = [];
  let initialTestIds = new Set<number>();

  const SUPABASE_STORAGE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL;

  onMount(async () => {
    await fetchPatientVisitData();
  });

  async function fetchPatientVisitData() {
    const { data, error } = await supabase
      .from('patient_visits')
      .select('*')
      .eq('id', patientVisitId)
      .single();

    if (error) {
      console.error('Error fetching patient visit:', error);
      return;
    }

    selectedLabId = data.lab_id;
    selectedDoctorId = data.doctor_id;
    selectedStatusId = data.status_id;
    patient_registration_id = data.patient_registration_id;
    registrationDate = toLocaleDateFormat(data.registered_date);
    deadline = toLocaleDateFormat(data.deadline);
    fileNames = data.files || [];
    reportNames = data.reports || [];

    // Fetch and set selected tests
    const { data: testsData, error: testsError } = await supabase
      .from('patient_test')
      .select('t_id')
      .eq('p_id', patientVisitId);

    if (testsError) {
      console.error('Error fetching patient tests:', testsError);
      return;
    }

   
    testsData.forEach(test => {
      selectedTests.add(test.t_id);
      initialTestIds.add(test.t_id);
    });


    // Fetch and set selected sample types
    const { data: sampleTypesData, error: sampleTypesError } = await supabase
      .from('patient_sample_type')
      .select('s_id, number')
      .eq('p_id', patientVisitId);

    if (sampleTypesError) {
      console.error('Error fetching patient sample types:', sampleTypesError);
      return;
    }

    sampleTypesData.forEach(sampleType => selectedSampleTypes.set(sampleType.s_id, sampleType.number));
  }

  function handleFileUpload(event: Event, type: 'files' | 'reports') {
    const target = event.target as HTMLInputElement;
    const uploadedFiles = Array.from(target.files || []);

    if (type === 'files') {
      const newFiles = uploadedFiles.map(file => ({
        file,
        randomName: getRandomString() + '.' + file.name.split('.').pop()
      }));
      files = [...files, ...newFiles];
      fileNames = [...fileNames, ...newFiles.map(fileObj => fileObj.randomName)];
    } else if (type === 'reports') {
      const newReports = uploadedFiles.map(file => ({
        file,
        randomName: getRandomString() + '.' + file.name.split('.').pop()
      }));
      reports = [...reports, ...newReports];
      reportNames = [...reportNames, ...newReports.map(fileObj => fileObj.randomName)];
    }

    // Ensure no duplicates in files and reports
    files = files.filter((fileObj, index, self) =>
      index === self.findIndex((f) => (
        f.randomName === fileObj.randomName
      ))
    );
    reports = reports.filter((fileObj, index, self) =>
      index === self.findIndex((f) => (
        f.randomName === fileObj.randomName
      ))
    );
  }

  function getRandomString() {
    return uuidv4().split("-")[0];
  }

  async function uploadFileToSupabase(fileObj: { file: File; randomName: string }, folder: string) {
    const { file, randomName } = fileObj;
    const { data, error } = await supabase.storage
      .from(folder)
      .upload(randomName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }

    return randomName;
  }

  function getSupabaseFileUrl(folder: string, path: string) {
    return `${SUPABASE_STORAGE_URL}/${folder}/${path}`;
  }

  async function removeFile(folder: string, fileName: string, type: 'files' | 'reports') {
    const { error } = await supabase.storage
      .from(folder)
      .remove([fileName]);

    if (error) {
      console.error("Error removing file:", error);
      return;
    }

    if (type === 'files') {
      removedFiles.push(fileName);
      fileNames = fileNames.filter(name => name !== fileName);
    } else if (type === 'reports') {
      removedReports.push(fileName);
      reportNames = reportNames.filter(name => name !== fileName);
    }
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
    const fileUploadPromises = files.map(fileObj => uploadFileToSupabase(fileObj, 'patient_files'));
    const reportUploadPromises = reports.map(fileObj => uploadFileToSupabase(fileObj, 'patient_files'));

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
      files: [...new Set([...fileNames.filter(name => !removedFiles.includes(name)), ...filesPaths])],
      reports: [...new Set([...reportNames.filter(name => !removedReports.includes(name)), ...reportsPaths])]
    };

    // Update patient_visits
    const { data, error: visitError } = await supabase
      .from('patient_visits')
      .update(payload)
      .eq('id', patientVisitId);

    if (visitError) {
      console.error('Error updating patient visit:', visitError);
      return;
    }

    // Update tests
    const { error: deleteTestsError } = await supabase
      .from('patient_test')
      .delete()
      .eq('p_id', patientVisitId);

    if (deleteTestsError) {
      console.error('Error deleting old patient tests:', deleteTestsError);
      return;
    }

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

    // Update sample types
    const { error: deleteSampleTypesError } = await supabase
      .from('patient_sample_type')
      .delete()
      .eq('p_id', patientVisitId);

    if (deleteSampleTypesError) {
      console.error('Error deleting old patient sample types:', deleteSampleTypesError);
      return;
    }

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

  // Check if the selected tests have changed
    const initialTestIdsArray = Array.from(initialTestIds);
    const selectedTestsArray = Array.from(selectedTests);
    const testsChanged = initialTestIdsArray.length !== selectedTestsArray.length ||
      !initialTestIdsArray.every(id => selectedTestsArray.includes(id));

    if (testsChanged) {
      goto(`/dashboard/accountant/${patientVisitId}`, { replaceState: true });
    } else {
      history.back();
    }
  }

  
  function getFileUrl(fileName: string, type: 'existing' | 'new', kind: 'files' | 'reports'): string {
    if (type === 'existing') {
      return getSupabaseFileUrl('patient_files', fileName);
    } else {
      const fileObj = (kind === 'files' ? files : reports).find(f => f.randomName === fileName);
      if (fileObj) {
        return URL.createObjectURL(fileObj.file);
      }
      return '';
    }
  }
</script>

<div class="max-w-screen-md mx-auto py-10">
  {#if patient_registration_id}
    <UserProfile {patient_registration_id} />
  {/if}
  <div class="my-6" style="border: 1px solid var(--textColor);"></div> <!-- adding border -->

  <div class="grid grid-cols-2 gap-4">
    <DropdownTests bind:selectedTests />
    <DropdownSampleTypes bind:selectedSampleTypes />
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
      </div>
      {#if fileNames.length > 0}
        <div class="mt-4 text-sm">
          {#each fileNames as fileName, index}
            <div class="flex items-center justify-between">
              <a href={getFileUrl(fileName, index < fileNames.length - files.length ? 'existing' : 'new', 'files')} target="_blank" class="text-blue-500 underline">{fileName}</a>
              <button on:click={() => removeFile('patient_files', fileName, 'files')}>
                <IconX stroke={2} class="text-red-500 hover:text-red-700 transition-all" />
              </button>
            </div>
          {/each}
        </div>
      {/if}
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
      </div>
      {#if reportNames.length > 0}
        <div class="mt-4 text-sm">
          {#each reportNames as reportName, index}
            <div class="flex items-center justify-between">
              <a href={getFileUrl(reportName, index < reportNames.length - reports.length ? 'existing' : 'new', 'reports')} target="_blank" class="text-blue-500 underline">{reportName}</a>
              <button on:click={() => removeFile('patient_files', reportName, 'reports')}>
                <IconX stroke={2} class="text-red-500 hover:text-red-700 transition-all" />
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="flex justify-end">
    <CustomButton
      width="20%"
      height="3rem"
      icon={IconPlus}
      label="Update"
      on:click={submitForm}
    />
  </div>
</div>
