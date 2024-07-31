<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { writable } from 'svelte/store';
  import { Button, Dropdown, DropdownItem, Search } from 'flowbite-svelte';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';

  export let selectedFamilyMemberId:number;
  const familyMembers:any = writable([]);
  let searchTerm = '';
  const dispatch = createEventDispatcher();

  async function fetchFamilyMembers() {
    const { data, error } = await supabase
      .rpc('get_paged_family_members_filter', {
        filter_phonenumber: searchTerm,
        page_num: 1,
        page_size: 10
      });

    if (error) {
      console.error('Error fetching family members:', error);
    } else {
      familyMembers.set(data);
    }
  }

  onMount(() => {
    fetchFamilyMembers();
  });

  $: if (searchTerm || searchTerm === '') {
    fetchFamilyMembers();
  }

  function handleSelection(familyMemberId:number) {
    selectedFamilyMemberId = familyMemberId;
    dispatch('change', familyMemberId);
  }
</script>

<Button>
  Select Family Member
  <ChevronDownOutline class="w-6 h-6 ms-2 text-white dark:text-white" />
</Button>
<Dropdown class="w-64 p-3 space-y-1 text-sm">
  <div slot="header" class="p-3">
    <Search
      size="md"
      bind:value={searchTerm}
      placeholder="Search by phone number"
      debounce={300}
    />
  </div>
  {#if $familyMembers.length === 0}
    <DropdownItem>No Family Member found.</DropdownItem>
  {/if}
  {#each $familyMembers as familyMember}
    <DropdownItem on:click={() => handleSelection(familyMember.id)}>
      {familyMember.phonenumber}
      {#if familyMember.id === selectedFamilyMemberId}
        <span class="text-green-500 ml-2">(Selected)</span>
      {/if}
    </DropdownItem>
  {/each}
</Dropdown>
