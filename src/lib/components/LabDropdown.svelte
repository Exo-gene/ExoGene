<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { Button, Dropdown, DropdownItem, Search } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { ChevronDownOutline } from "flowbite-svelte-icons";
 
  export let selectedLabId: number;
  const dispatch = createEventDispatcher();

  let searchTerm = "";
  let labItems: any[] = [];
  let selectedLabName: string = "";
  let lastFilter: string | undefined = "";

  async function fetchLabs(titleFilter?: string) {
    if (titleFilter === lastFilter) return;
    lastFilter = titleFilter;

    const params = {
      page_num: 1,
      page_size: 10,
      filter_title: titleFilter || null,
    };

    const query = await supabase.rpc("get_paged_lab_filter", params);
    if (query.error) {
      console.error("Fetch lab error:", query.error);
      return;
    }
    labItems = query.data || [];
  }

  async function fetchLabById(labId: number) {
    const { data, error } = await supabase
      .from("lab")
      .select("*")
      .eq("id", labId)
      .is("deleted_at", null)
      .single();
    if (error) {
      console.error("Fetch lab by ID error:", error);
      return;
    }
    selectedLabName = data.name;
  }

  onMount(() => {
    fetchLabs(); // Initial fetch without any filter
    if (selectedLabId) {
      fetchLabById(selectedLabId); // Fetch the lab name based on the initial selectedLabId
    }
  });

  $: if (searchTerm && searchTerm.trim()) {
    fetchLabs(searchTerm);
  } else if (searchTerm === "") {
    fetchLabs(); // Reset filter when search term is cleared
  }

  function handleSelection(item: any, event: MouseEvent) {
    event.stopPropagation();
    selectedLabId = item.id;
    selectedLabName = item.lab_name;
    searchTerm = item.lab_name;
    dispatch("labChange", item.id);
  }

  function isSelected(id: number): boolean {
    return selectedLabId === id;
  }

  function truncate(text: string, maxLength: number) {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }
</script>

<div class="my-2">
  <Button class="w-96 h-10 rounded-lg flex justify-center items-center text-center text-base  duration-300 ease-in-out">
    {"Select Lab"} 
    <ChevronDownOutline class="w-6 h-6 ms-2 text-white dark:text-white" />
  </Button>
  <Dropdown class="w-96 p-3 space-y-1 text-sm">
    <div slot="header" class="p-3">
      <Search
        size="md"
        bind:value={searchTerm}
        placeholder="Search lab by title..."
        debounce={300}
      />
    </div>
    {#if labItems.length === 0}
      <DropdownItem>No lab found.</DropdownItem>
    {/if}
    {#each labItems as item}
      <DropdownItem
        class="flex items-center justify-between w-full"
        on:click={(event) => handleSelection(item, event)}
        
        aria-selected={isSelected(item.id).toString()}
      >
        {truncate(item.lab_name, 30)}{isSelected(item.id) ? " (Selected)" : ""}
      </DropdownItem>
    {/each}
  </Dropdown>
</div>
 