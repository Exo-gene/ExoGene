<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { Button, Dropdown, DropdownItem, Search } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient"; 
  import type { CategoryDataModel } from "../../models/categoryModel";

  export let selectedCategoryId: number;

  const dispatch = createEventDispatcher();

  let searchTerm = "";
  let categoryItems: CategoryDataModel[] = [];
  let lastFilter: string | undefined = "";

  async function fetchCategory(titleFilter?: string) {
    if (titleFilter === lastFilter) return;
    lastFilter = titleFilter;

    const params = {
      page_num: 1,
      page_size:10,
      filter_title: titleFilter || undefined,
    };

    const query = await supabase.rpc("get_paged_category_filter", params);
    if (query.error) {
      console.error("Fetch category error:", query.error);
      return;
    }
    categoryItems = query.data.items || [];
  }

  onMount(() => {
    fetchCategory(); // Initial fetch without any filter
  });

  $: if (searchTerm.trim()) {
    fetchCategory(searchTerm);
  } else if (searchTerm === "") {
    fetchCategory(); // Explicitly handle empty search term to reset the filter
  }

  function handleSelection(item: CategoryDataModel, event: MouseEvent) {
    event.stopPropagation();
    selectedCategoryId = item.id;
    searchTerm = item.title;

    // Using event dispatcher instead of direct call
    dispatch('categoryChange', item.id);
  }

  function isSelected(id: number): boolean {
    return selectedCategoryId === id;
  }
</script>

<div class="my-2">
  <Button>Select Category</Button>
  <Dropdown class="w-full">
    <div slot="header" class="p-3">
      <Search
        size="md"
        bind:value={searchTerm}
        placeholder="Search category by title..."
        debounce={300}
      />
    </div>
    {#if categoryItems.length === 0}
      <DropdownItem>No category found.</DropdownItem>
    {/if}
    {#each categoryItems as item}
      <DropdownItem
        class="flex items-center justify-between"
        on:click={(event) => handleSelection(item, event)}
      >
        {item.title}
        {isSelected(item.id) ? " (Selected)" : ""}
      </DropdownItem>
    {/each}
  </Dropdown>
</div>
