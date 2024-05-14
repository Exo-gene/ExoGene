<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { Button, Dropdown, DropdownItem, Search, Checkbox } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  // @ts-ignore
  import { debounce } from "lodash-es";

  export let selectedCategoryIds: number[] = [];
  export let selectedSubCategoryIds: number[] = [];
  const dispatch = createEventDispatcher();
  let searchTerm = "";
  let categoryItems: any = [];
  let isLoading = false;
  let errorMessage = "";

  // Initialize the sets with the incoming selected IDs
  let selectedCategoryIdsData = new Set(selectedCategoryIds);
  let selectedSubCategoryIdsData = new Set(selectedSubCategoryIds);

  // Reactively update the sets whenever the props change
  $: selectedCategoryIdsData = new Set(selectedCategoryIds);
  $: selectedSubCategoryIdsData = new Set(selectedSubCategoryIds);

 

  async function fetchCategory(titleFilter?: string) {
    isLoading = true;
    errorMessage = "";
    const params = { page_num: 1, page_size: 3, filter_title: titleFilter || undefined };

    try {
      const { data, error } = await supabase.rpc("get_paged_category_filter_depend_subcategory", params);
      if (error) throw new Error("Failed to fetch categories.");
      categoryItems = data.items || [];
    } catch (error) {
      // errorMessage = error.message;
    } finally {
      isLoading = false;
    }
  }

  const debouncedFetch = debounce(fetchCategory, 300);

  $: if (searchTerm.trim()) {
    debouncedFetch(searchTerm);
  } else if (searchTerm === "") {
    fetchCategory();
  }

  function handleCategorySelection(categoryId: number, isSelected: boolean) {
    if (isSelected) {
      selectedCategoryIdsData.add(categoryId);
    } else {
      selectedCategoryIdsData.delete(categoryId);
      categoryItems.find((c: any) => c.category_id === categoryId)?.subcategories.forEach((sub: any) => {
        selectedSubCategoryIdsData.delete(sub.id);
      });
    }
    dispatchSelections();
  }

  function handleSubcategorySelection(categoryId: number, subcategoryId: number, isSelected: boolean) {
    if (isSelected) {
      selectedSubCategoryIdsData.add(subcategoryId);
      selectedCategoryIdsData.add(categoryId);
    } else {
      selectedSubCategoryIdsData.delete(subcategoryId);
      const allDeselected = categoryItems.find((c: any) => c.category_id === categoryId)?.subcategories.every((sub: any) => !selectedSubCategoryIdsData.has(sub.id));
      if (allDeselected) {
        selectedCategoryIdsData.delete(categoryId);
      }
    }
    dispatchSelections();
  }

  function dispatchSelections() {
    dispatch("categoryChange", {
      categoryIds: Array.from(selectedCategoryIdsData),
      subcategoryIds: Array.from(selectedSubCategoryIdsData),
    });
  }

  function isChecked(set: any, id: number) {
    return set.has(id);
  }
</script>

<div class="my-2">
  <Button>Select Category</Button>
  <Dropdown class="w-full">
    <div slot="header" class="p-3">
      <Search size="md" bind:value={searchTerm} placeholder="Search category by title..." debounce={300} />
    </div>
    {#each categoryItems as category}
      <DropdownItem class="flex items-center justify-between">
        <div class="flex items-center">
          <Checkbox checked={isChecked(selectedCategoryIdsData, category.category_id)} on:change={(e) => handleCategorySelection(category.category_id, e.target.checked)} />
          <span class="ml-2">{category.category_title}</span>
        </div>
        {#if category.subcategories && category.subcategories.length}
        <svg class="bg-slate-200 icon rounded" width="20px" height="20px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z" fill="#000000"></path></g></svg>
        
         <Dropdown class="ml-4" placement="right-start">
            {#each category.subcategories as subcategory}
              <DropdownItem>
                <div class="flex items-center">
                  <Checkbox checked={isChecked(selectedSubCategoryIdsData, subcategory.id)} on:change={(e) => handleSubcategorySelection(category.category_id, subcategory.id, e.target.checked)} />
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
