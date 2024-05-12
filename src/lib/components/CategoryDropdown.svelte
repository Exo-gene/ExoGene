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
  import { debounce } from "lodash-es";

  const dispatch = createEventDispatcher();
  let searchTerm = "";
  let categoryItems: any = [];
  let isLoading = false;
  let errorMessage = "";

  let selectedCategoryIds = new Set();
  let selectedSubCategoryIds = new Set();

  async function fetchCategory(titleFilter?: string) {
    isLoading = true;
    errorMessage = "";

    const params = {
      page_num: 1,
      page_size: 3,
      filter_title: titleFilter || undefined,
    };

    try {
      const { data, error } = await supabase.rpc(
        "get_paged_category_filter_depend_subcategory",
        params
      );

      if (error) throw new Error("Failed to fetch categories.");
      categoryItems = data.items || [];
    } catch (error) {
      errorMessage = error.message;
    } finally {
      isLoading = false;
    }
  }

  const debouncedFetch = debounce(fetchCategory, 300);

  onMount(() => {
    fetchCategory();
  });

  $: if (searchTerm.trim()) {
    debouncedFetch(searchTerm);
  } else if (searchTerm === "") {
    fetchCategory();
  }

  function handleCategorySelection(categoryId: number, isSelected: boolean) {
    if (isSelected) {
      selectedCategoryIds.add(categoryId);
    } else {
      selectedCategoryIds.delete(categoryId);
      categoryItems
        .find((c) => c.category_id === categoryId)
        ?.subcategories.forEach((sub) => selectedSubCategoryIds.delete(sub.id));
    }
    dispatchSelections();
  }

  function handleSubcategorySelection(
    categoryId: number,
    subcategoryId: number,
    isSelected: boolean
  ) {
    if (isSelected) {
      selectedSubCategoryIds.add(subcategoryId);
      selectedCategoryIds.add(categoryId); // Ensure the parent category is selected
    } else {
      selectedSubCategoryIds.delete(subcategoryId);
    }
    dispatchSelections();
  }

  function dispatchSelections() {
    dispatch("categoryChange", {
      categoryIds: Array.from(selectedCategoryIds),
      subcategoryIds: Array.from(selectedSubCategoryIds),
    });
  }

  function isChecked(set, id) {
    return set.has(id);
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
    {#each categoryItems as category}
      <DropdownItem class="flex items-center justify-between">
        <div class="flex items-center">
          <Checkbox
            checked={isChecked(selectedCategoryIds, category.category_id)}
            on:change={(e) =>
              handleCategorySelection(category.category_id, e.target.checked)}
          />
          <span class="ml-2">{category.category_title}</span>
        </div>
        {#if category.subcategories && category.subcategories.length}
          <Dropdown class="ml-4" placement="right-start">
            {#each category.subcategories as subcategory}
              <DropdownItem>
                <div class="flex items-center">
                  <Checkbox
                    checked={isChecked(selectedSubCategoryIds, subcategory.id)}
                    on:change={(e) =>
                      handleSubcategorySelection(
                        category.category_id,
                        subcategory.id,
                        e.target.checked
                      )}
                  />
                  <span class="ml-2">{subcategory.title}</span>
                </div>
              </DropdownItem>
            {/each}
          </Dropdown>
        {/if}
      </DropdownItem>
    {/each}
  </Dropdown>
  {#if errorMessage}
    <p class="text-red-500">{errorMessage}</p>
  {/if}
</div>
