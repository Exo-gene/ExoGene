<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { Button, Dropdown, DropdownItem, Search } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { ChevronDownOutline } from "flowbite-svelte-icons";
 
  export let selectedStatusId: number;
  const dispatch = createEventDispatcher();

  let searchTerm = "";
  let statusItems: any[] = [];
  let selectedStatusName: string = "";
  let lastFilter: string | undefined = "";

  async function fetchStatus(titleFilter?: string) {
    if (titleFilter === lastFilter) return;
    lastFilter = titleFilter;

    const params = {
      page_num: 1,
      page_size: 10,
      filter_title: titleFilter || null,
    };

    const query = await supabase.rpc("get_paged_status_filter", params);
    if (query.error) {
      console.error("Fetch status error:", query.error);
      return;
    }
    statusItems = query.data || [];
  }

  async function fetchStatusById(statusId: number) {
    const { data, error } = await supabase
      .from("status")
      .select("*")
      .eq("id", statusId)
      .is("deleted_at", null)
      .single();
    if (error) {
      console.error("Fetch status by ID error:", error);
      return;
    }
    selectedStatusName = data.name;
  }

  onMount(() => {
    fetchStatus(); // Initial fetch without any filter
    if (selectedStatusId) {
      fetchStatusById(selectedStatusId); // Fetch the status name based on the initial selectedStatusId
    }
  });

  $: if (searchTerm && searchTerm.trim()) {
    fetchStatus(searchTerm);
  } else if (searchTerm === "") {
    fetchStatus(); // Reset filter when search term is cleared
  }

  function handleSelection(item: any, event: MouseEvent) {
    event.stopPropagation();
    selectedStatusId = item.id;
    selectedStatusName = item.name;
    searchTerm = item.name;
    dispatch("statusChange", item.id);
  }

  function isSelected(id: number): boolean {
    return selectedStatusId === id;
  }

  function truncate(text: string, maxLength: number) {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }
</script>

 
  <Button class="w-96 h-10 rounded-lg flex justify-center items-center text-center text-base  duration-300 ease-in-out">
     {"Select status"} 
    <ChevronDownOutline class="w-6 h-6 ms-2 text-white dark:text-white" />
  </Button>
  <Dropdown class="w-96 p-3 space-y-1 text-sm">
    <div slot="header" class="p-3">
      <Search
        size="md"
        bind:value={searchTerm}
        placeholder="Search status by title..."
        debounce={300}
      />
    </div>
    {#if statusItems.length === 0}
      <DropdownItem>No status found.</DropdownItem>
    {/if}
    {#each statusItems as item}
      <DropdownItem
        class="flex items-center justify-between w-full"
        on:click={(event) => handleSelection(item, event)}
        
        aria-selected={isSelected(item.id).toString()}
      >
        {truncate(item.name, 30)}{isSelected(item.id) ? " (Selected)" : ""}
      </DropdownItem>
    {/each}
  </Dropdown>
 
 