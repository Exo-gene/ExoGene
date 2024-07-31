<script lang="ts">
  import { page } from '$app/stores';
  import DropdownStatuses from '$lib/components/DropdownStatuses.svelte';
  import LabDropdown from '$lib/components/LabDropdown.svelte';
  import { supabase } from '$lib/supabaseClient';
  import DropdownTests from '$lib/components/DropdownTests.svelte';
  import DropdownSampleTypes from '$lib/components/DropdownSampleTypes.svelte';
  import DoctorDropdown from '$lib/components/DoctorDropdown.svelte';
  import CustomButton from '$lib/components/CustomButton.svelte';
  import { IconPlus } from '@tabler/icons-svelte';

  const patient_registration_id = +$page.params.patientVisitId;
  let selectedTests = new Set<number>();
  let selectedSampleTypes = new Map<number, number>();  
  let selectedLabId:number;
  let selectedDoctorId:number;
  let selectedStatusId:number;

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

    // Submit tests
    const insertDataTests = Array.from(selectedTests).map(testId => ({
      p_id: patient_registration_id,
      t_id: testId,
    }));

    const { error: testsError } = await supabase
      .from('patient_test')
      .insert(insertDataTests);

    if (testsError) {
      console.error('Error inserting patient tests:', testsError);
    } else {
    //   alert('Tests assigned successfully');
    }

    // Submit sample types
    const insertDataSampleTypes = Array.from(selectedSampleTypes.entries()).map(([sampleTypeId, number]) => ({
      p_id: patient_registration_id,
      s_id: sampleTypeId,
      number: number,
    }));

    const { error: sampleTypesError } = await supabase
      .from('patient_sample_type')
      .insert(insertDataSampleTypes);

    if (sampleTypesError) {
      console.error('Error inserting patient sample types:', sampleTypesError);
    } else {
    //   alert('Sample types assigned successfully');
    }

    // Submit lab and status
    const { error: labStatusError } = await supabase
      .from('patient_visits')
      .update({
        lab_id: selectedLabId,
        status_id: selectedStatusId,
        doctor_id: selectedDoctorId,
        patient_registration_id: patient_registration_id,
      })
      .eq('id', patient_registration_id);

    if (labStatusError) {
      console.error('Error updating patient visit:', labStatusError);
    } else {
    //   alert('Lab and status updated successfully');
    }
  }

  
</script>

<div class="max-w-screen-md mx-auto py-10">
  <DropdownTests patientId={patient_registration_id} bind:selectedTests />
  <div class="mt-6">
    <DropdownSampleTypes patientId={patient_registration_id} bind:selectedSampleTypes />
  </div>
   <div class="mt-6">
    <DoctorDropdown bind:selectedDoctorId />
  </div>
  <div class="mt-6">
    <LabDropdown bind:selectedLabId />
  </div>
  <div class="mt-6">
    <DropdownStatuses bind:selectedStatusId />
  </div>
            <CustomButton
            width="20%"
            height="3rem"
            icon={IconPlus}
            label="Add"
            on:click={submitForm}
          />
</div>
