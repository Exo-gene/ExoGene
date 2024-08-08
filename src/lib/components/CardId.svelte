<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from "svelte";
  import type { PatientRegistrationDataModel } from "../../models/patientRegistrationModel";
  import { patientRegistrationStore } from '../../stores/patientRegistrationStore';

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

  function printCard() {
    const printContents = document.getElementById('printable-card')?.innerHTML;
    if (printContents) {
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow?.document.write('<html><head><title>Print Card</title>');
      printWindow?.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
      printWindow?.document.write(`<style>
        @page { size: auto; margin: 0; }
        body { margin: 0; padding: 20px; }
        .card { width: 350px; }
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      </style>`);
      printWindow?.document.write('</head><body class="bg-white">');
      printWindow?.document.write(printContents);
      printWindow?.document.write('</body></html>');
      printWindow?.document.close();
      printWindow?.print();
    } else {
      console.error('No printable content found');
    }
  }
</script>

<div id="printable-card" class="max-w-xs mx-auto border border-gray-300 p-4 rounded-lg shadow-lg card">
  {#if patientRegistrationData}
    <div class="bg-indigo-800 text-white p-2 rounded-t-lg text-center">
      <h2 class="text-lg font-semibold">EXO-GENE</h2>
    </div>
    <div class="p-4">
      <p class="mb-2"><strong>Name:</strong> {patientRegistrationData.name}</p>
      <p class="mb-2"><strong>ID:</strong> {patientRegistrationData.id}</p>
      <p class="mb-2"><strong>Birth Date:</strong> {patientRegistrationData.birth_date}</p>
      <p class="mb-2"><strong>Phone Number:</strong> {patientRegistrationData.phonenumber}</p>
      <p class="mb-2"><strong>Address:</strong> {patientRegistrationData.address}</p>
      <p class="mb-2"><strong>Created At:</strong> {patientRegistrationData.created_at}</p>
      <p class="mb-2"><strong>Unique Family Member ID:</strong> {patientRegistrationData.uniqid_family_member}</p>
    </div>
  {/if}
</div>

<div class="mt-4 text-center">
  <button class="no-print bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" on:click={printCard}>Print</button>
</div>

<style>
  .no-print {
    position: absolute;
    top: 8px;
    right: 8px;
  }

  @media print {
    .no-print {
      display: none;
    }

    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
</style>
