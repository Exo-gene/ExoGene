<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { writable } from 'svelte/store';
  import { Button, Dropdown, Checkbox, DropdownItem } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';
  import SearchComponent from './SearchComponent.svelte';

  export let selectedSampleTypes = new Map<number, number>(); // Map to store sampleTypeId and its number
  export let patientId: number;
  const sampleTypes = writable([]);
  let isLoading = true;
  const dispatch = createEventDispatcher();
  const forceUpdate = writable(0);  

  async function fetchSampleTypes(titleFilter = "") {
    const params = {
      filter_title: titleFilter || '',
      page_num: 1,
      page_size: 10
    };

    const { data, error } = await supabase.rpc('get_paged_sample_types_filter', params);

    if (error) {
      console.error('Error fetching sample types:', error);
    } else {
      sampleTypes.set(data);
    }
  }

  onMount(() => {
    fetchSampleTypes();
    isLoading = false;
  });

  function toggleSelection(sampleTypeId: number) {
    if (selectedSampleTypes.has(sampleTypeId)) {
      selectedSampleTypes.delete(sampleTypeId);
    } else {
      selectedSampleTypes.set(sampleTypeId, 0);  
    }
    forceUpdate.update(n => n + 1);  
    dispatch('change', new Map(selectedSampleTypes));
  }

  function updateNumber(sampleTypeId: number, event) {
    const number = parseInt(event.target.value, 10);
    selectedSampleTypes.set(sampleTypeId, number);
    forceUpdate.update(n => n + 1);  
    dispatch('change', new Map(selectedSampleTypes));
  }

  function handleSearch(event) {
    fetchSampleTypes(event.detail);
  }
</script>

{#if isLoading}
  <p>Loading...</p>
{:else}
  <div>
    <Button>
      Select SampleTypes
      <ChevronDownOutline class="w-6 h-6 ms-2 text-white dark:text-white" />
    </Button>
    <Dropdown class="w-64 p-3 space-y-1 text-sm">
      <div slot="header" class="p-3">
        <SearchComponent on:search={handleSearch} />
      </div>
      {#if $sampleTypes.length === 0}
        <DropdownItem>No Sample Type found.</DropdownItem>
      {/if}
       
      {#each $sampleTypes as sampleType}
        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex justify-between items-center">
          <Checkbox
            checked={selectedSampleTypes.has(sampleType.id)}
            on:change={() => toggleSelection(sampleType.id)}
          >
            {sampleType.name}
          </Checkbox>
            <input
              min="0"
              type="number"
              class="ml-2 border rounded p-1 w-20"
              placeholder="Number"
              value={selectedSampleTypes.get(sampleType.id)}
              on:input={(e) => updateNumber(sampleType.id, e)}
            />
        </li>
      {/each}
    </Dropdown>
  </div>
{/if}
