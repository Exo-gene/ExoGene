<script lang="ts">
  import { Input } from 'flowbite-svelte';
  import { supabase } from '$lib/supabaseClient';
  import { patientRegistrationStore } from './../../stores/patientRegistrationStore.ts';
  import { onMount } from "svelte";
  import type { PatientRegistrationDataModel } from "../../models/patientRegistrationModel";

  export let patient_registration_id: number;
  let patientRegistrationData: PatientRegistrationDataModel | null = null;

  onMount(async () => {
    try {
      patientRegistrationData = await patientRegistrationStore.getPatientRegistrationById(patient_registration_id, supabase);
      if (patientRegistrationData?.created_at) {
        patientRegistrationData.created_at = new Date(patientRegistrationData.created_at).toLocaleString();
      }
    } catch (error) {
      console.error("Failed to fetch patient registration data:", error);
    }
  });
</script>

{#if patientRegistrationData}
  <div class="grid grid-cols-1 space-x-2 sm:grid-cols-2">
    {#each Object.keys(patientRegistrationData) as key, index}
      <div class="mb-4">
        <label for={key} class="block text-sm font-medium " style="color: var(--textColor);">
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </label>
        <Input
          id={key}
          type="text"
          value={patientRegistrationData[key]}
          disabled
          class="mt-1 block w-full"
        />
      </div>
      {#if (index % 2 === 1)}
        <div class="col-span-2"></div>
      {/if}
    {/each}
  </div>
{:else}
  <p>Loading...</p>
{/if}
