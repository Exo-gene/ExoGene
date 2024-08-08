<script lang="ts">
  import { page } from '$app/stores';
  import CardId from '$lib/components/CardId.svelte';
  import UserProfile from '$lib/components/UserProfile.svelte';
   
  const patient_registration_id = +$page.params.patientVisitId;

  function printCard() {
    const printContents = document.getElementById('printable-card').innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload the page to restore the original contents
  }
</script>


<div>
  <CardId {patient_registration_id}/>
</div>

<UserProfile {patient_registration_id} />
 
