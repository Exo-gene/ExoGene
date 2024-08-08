<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { Button, Dropdown, DropdownItem, Search } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { ChevronDownOutline } from "flowbite-svelte-icons";
 
  export let selectedCompanyId: number;
  const dispatch = createEventDispatcher();

  let searchTerm = "";
  let companyItems: any[] = [];
  let selectedCompanyName: string = "";
  let lastFilter: string | undefined = "";

  async function fetchCompanies(titleFilter?: string) {
    if (titleFilter === lastFilter) return;
    lastFilter = titleFilter;

    const params = {
      page_num: 1,
      page_size: 10,
      filter_title: titleFilter || null,
    };

    const query = await supabase.rpc("get_paged_company_filter", params);
    if (query.error) {
      console.error("Fetch company error:", query.error);
      return;
    }
    companyItems = query.data || [];
  }

  async function fetchCompanyById(companyId: number) {
    const { data, error } = await supabase
      .from("company")
      .select("*")
      .eq("id", companyId)
      .is("deleted_at", null)
      .single();
    if (error) {
      console.error("Fetch company by ID error:", error);
      return;
    }
    selectedCompanyName = data.name;
  }

  onMount(() => {
    fetchCompanies(); 
    if (selectedCompanyId) {
      fetchCompanyById(selectedCompanyId);  
    }
  });

  $: if (searchTerm && searchTerm.trim()) {
    fetchCompanies(searchTerm);
  } else if (searchTerm === "") {
    fetchCompanies();  
  }

  function handleSelection(item: any, event: MouseEvent) {
    event.stopPropagation();
    selectedCompanyId = item.id;
    selectedCompanyName = item.name;
    searchTerm = item.name;
    dispatch("companyChange", item.id);
  }

  function isSelected(id: number): boolean {
    return selectedCompanyId === id;
  }

  function truncate(text: string, maxLength: number) {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }
</script>

<div class="my-2">
   <Button class="w-96 h-10 rounded-lg flex justify-center items-center text-center text-base  duration-300 ease-in-out">
     {"Select Company"} 
    <ChevronDownOutline class="w-6 h-6 ms-2 text-white dark:text-white" />
  </Button>
  <Dropdown class="w-96 p-3 space-y-1 text-sm">
    <div slot="header" class="p-3">
      <Search
        size="md"
        bind:value={searchTerm}
        placeholder="Search company by title..."
        debounce={300}
      />
    </div>
    {#if companyItems.length === 0}
      <DropdownItem>No company found.</DropdownItem>
    {/if}
    {#each companyItems as item}
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
 