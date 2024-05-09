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

  export let selectedSubCategoryIds: number[] = [];
  const dispatch = createEventDispatcher();
  let searchTerm = "";
  let subcategoryItems: any[] = [];
  let lastFilter: string | undefined = "";

  async function fetchSubCategory(titleFilter?: string) {
    if (titleFilter === lastFilter) return;
    lastFilter = titleFilter;

    const params = {
      page_num: 1,
      page_size: 10,
      filter_title: titleFilter || undefined,
    };

    const query = await supabase.rpc("get_paged_subcategory_filter", params);
    if (query.error) {
      console.error("Fetch subcategory error:", query.error);
      return;
    }
    subcategoryItems = query.data.items || [];
  }

  onMount(() => {
    fetchSubCategory();
  });

  $: if (searchTerm.trim()) {
    fetchSubCategory(searchTerm);
  } else if (searchTerm === "") {
    // Avoid clearing fetched subcategories if search is cleared but keep selected categories
    fetchSubCategory();
  }

  function handleSelection(item: any, event: MouseEvent) {
    event.stopPropagation();

    const isSelected = selectedSubCategoryIds.includes(item.id);

    if (isSelected) {
      selectedSubCategoryIds = selectedSubCategoryIds.filter((id) => id !== item.id);
    } else {
      selectedSubCategoryIds = [...selectedSubCategoryIds, item.id];
    }
    dispatch("categoryChange", selectedSubCategoryIds);
  }

  function isSelected(id: number): boolean {
    return selectedSubCategoryIds.includes(id);
  }
</script>

<div class="my-2">
  <Button>Select SubCategory</Button>
  <Dropdown class="w-full">
    <div slot="header" class="p-3">
      <Search
        size="md"
        bind:value={searchTerm}
        placeholder="Search SubCategory by title..."
        debounce={300}
      />
    </div>
    {#if subcategoryItems.length === 0}
      <DropdownItem>No SubCategory found.</DropdownItem>
    {/if}
    {#each subcategoryItems as item}
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
