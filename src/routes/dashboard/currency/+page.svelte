<!-- src/routes/index.svelte -->
<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';
  import 'flowbite-svelte';
  import CustomButton from '$lib/components/CustomButton.svelte';
  import { IconPlus } from '@tabler/icons-svelte';
  import { goto } from '$app/navigation';

  let country = 'Iraq';
  let money_dinar = '';
  let dataExists = false;

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('currency')
      .select('*')
      .eq('country', country)
      .single();

    if (data) {
      money_dinar = data.money_dinar;
      dataExists = true;
    }
  };

  onMount(fetchData);

  const updateData = async () => {
    let response;
    if (dataExists) {
      response = await supabase
        .from('currency')
        .update({ money_dinar })
        .eq('country', country);
        
    } else {
      response = await supabase
        .from('currency')
        .insert([{ country, money_dinar }]);
    }

    const { error } = response;

    if (error) {
      console.error('Error saving data:', error);
    } else {
      console.log('Data saved successfully');
    }
    goto('/dashboard/home');
  };

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    updateData();
  };
</script>

<div class="max-w-screen-2xl mx-auto py-10">
  <form class="max-w-xl mx-auto space-y-4 p-8 rounded" style="border: 1px solid var(--backgroundButtonColor);">
    <div>
      <label for="country" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Country</label>
      <input id="country" type="text" bind:value={country} readonly class="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
    </div>
    <div>
      <label for="dollar" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Dollar</label>
      <input id="dollar" type="text" value="100$" readonly class="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
    </div>
    <div>
      <label for="money_dinar" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Money Dinar</label>
      <input id="money_dinar" type="text" bind:value={money_dinar} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Enter Dinar value" required />
    </div>
    <div class="flex justify-end">
      <CustomButton
        width="20%"
        height="2.5rem"
        icon={IconPlus}
        label="Submit"
        on:click={handleSubmit}
      />
    </div>
  </form>
</div>
