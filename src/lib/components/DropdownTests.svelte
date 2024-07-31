<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { writable } from 'svelte/store';
  import { Button, Dropdown, Checkbox, DropdownItem } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';
  import SearchComponent from './SearchComponent.svelte';

  export let selectedTests = new Set<number>();
  export let patientId: number;
  const tests = writable([]);
  let isLoading = true;
  const dispatch = createEventDispatcher();

  async function fetchTests(titleFilter = "") {
    const params = {
      filter_title: titleFilter || '',
      page_num: 1,
      page_size: 10
    };

    const { data, error } = await supabase.rpc('get_paged_test_filter', params);

    if (error) {
      console.error('Error fetching tests:', error);
    } else {
      tests.set(data);
    }
  }

  onMount(() => {
    fetchTests();
    isLoading = false;
  });

  function toggleSelection(testId: number) {
    if (selectedTests.has(testId)) {
      selectedTests.delete(testId);
    } else {
      selectedTests.add(testId);
    }
    dispatch('change', new Set(selectedTests));
  }

  function handleSearch(event) {
    fetchTests(event.detail);
  }
</script>

{#if isLoading}
  <p>Loading...</p>
{:else}
  <div>
    <Button>
      Select tests
      <ChevronDownOutline class="w-6 h-6 ms-2 text-white dark:text-white" />
    </Button>
    <Dropdown class="w-48 p-3 space-y-1 text-sm">
      <div slot="header" class="p-3">
        <SearchComponent on:search={handleSearch} />
      </div>
      {#if $tests.length === 0}
        <DropdownItem>No test found.</DropdownItem>
      {/if}
      {#each $tests as test}
        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
          <Checkbox
            checked={selectedTests.has(test.id)}
            on:change={() => toggleSelection(test.id)}
          >
            {test.name} - ${test.price}
          </Checkbox>
        </li>
      {/each}
    </Dropdown>
  </div>
{/if}
