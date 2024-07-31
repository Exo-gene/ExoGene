<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { Button, Dropdown, DropdownItem, Search } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { ChevronDownOutline } from "flowbite-svelte-icons";
 
  export let selectedDoctorId: number;
  const dispatch = createEventDispatcher();

  let searchTerm = "";
  let doctorItems: any[] = [];
  let selectedDoctorName: string = "";
  let lastFilter: string | undefined = "";

  async function fetchDoctors(titleFilter?: string) {
    if (titleFilter === lastFilter) return;
    lastFilter = titleFilter;

    const params = {
      page_num: 1,
      page_size: 10,
      filter_title: titleFilter || null,
    };

    const query = await supabase.rpc("get_paged_doctor_filter", params);
    if (query.error) {
      console.error("Fetch doctor error:", query.error);
      return;
    }
    doctorItems = query.data || [];
  }

  async function fetchDoctorById(doctorId: number) {
    const { data, error } = await supabase
      .from("doctor")
      .select("*")
      .eq("id", doctorId)
      .is("deleted_at", null)
      .single();
    if (error) {
      console.error("Fetch doctor by ID error:", error);
      return;
    }
    selectedDoctorName = data.name;
  }

  onMount(() => {
    fetchDoctors(); 
    if (selectedDoctorId) {
      fetchDoctorById(selectedDoctorId);  
    }
  });

  $: if (searchTerm && searchTerm.trim()) {
    fetchDoctors(searchTerm);
  } else if (searchTerm === "") {
    fetchDoctors();  
  }

  function handleSelection(item: any, event: MouseEvent) {
    event.stopPropagation();
    selectedDoctorId = item.id;
    selectedDoctorName = item.name;
    searchTerm = item.name;
    dispatch("doctorChange", item.id);
  }

  function isSelected(id: number): boolean {
    return selectedDoctorId === id;
  }

  function truncate(text: string, maxLength: number) {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }
</script>

<div class="my-2">
  <Button>
    {"Select Doctor"} 
    <ChevronDownOutline class="w-6 h-6 ms-2 text-white dark:text-white" />
  </Button>
  <Dropdown class="w-full">
    <div slot="header" class="p-3">
      <Search
        size="md"
        bind:value={searchTerm}
        placeholder="Search doctor by title..."
        debounce={300}
      />
    </div>
    {#if doctorItems.length === 0}
      <DropdownItem>No doctor found.</DropdownItem>
    {/if}
    {#each doctorItems as item}
      <DropdownItem
        class="flex items-center justify-between w-full"
        on:click={(event) => handleSelection(item, event)}
        
        aria-selected={isSelected(item.id).toString()}
      >
        {truncate(item.name, 30)}{isSelected(item.id) ? " (Selected)" : ""}
      </DropdownItem>
    {/each}
  </Dropdown>
</div>
 