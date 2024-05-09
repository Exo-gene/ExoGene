<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import {
    Button,
    Dropdown,
    DropdownItem,
    Search,
    Checkbox,
  } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";

  export let selectedCategoryIds: number[] = [];
  const dispatch = createEventDispatcher();
  let searchTerm = "";
  let categoryItems: any[] = [];
  let lastFilter: string | undefined = "";

  async function fetchCategory(titleFilter?: string) {
    if (titleFilter === lastFilter) return;
    lastFilter = titleFilter;

    const params = {
      page_num: 1,
      page_size: 3,
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
    fetchCategory();
  });

  $: if (searchTerm.trim()) {
    fetchCategory(searchTerm);
  } else if (searchTerm === "") {
    // Avoid clearing fetched categories if search is cleared but keep selected categories
    fetchCategory();
  }

  function handleSelection(item: any, event: MouseEvent) {
    event.stopPropagation();

    const isSelected = selectedCategoryIds.includes(item.id);

    if (isSelected) {
      selectedCategoryIds = selectedCategoryIds.filter((id) => id !== item.id);
    } else {
      selectedCategoryIds = [...selectedCategoryIds, item.id];
    }
    dispatch("categoryChange", selectedCategoryIds);
  }

  function isSelected(id: number): boolean {
    return selectedCategoryIds.includes(id);
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
      <DropdownItem class="flex items-center justify-between">
        <div class="flex items-center">
          <Checkbox
            checked={isSelected(item.id)}
            on:change={(event) => handleSelection(item, event)}
          />
          <span class="ml-2">{item.title}</span>
        </div>
      </DropdownItem>
    {/each}
  </Dropdown>
</div>
