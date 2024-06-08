<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { flip } from "svelte/animate";
  import { dndzone } from "svelte-dnd-action";
  import { supabase } from "$lib/supabaseClient";
  import InsertButton from "$lib/components/InsertButton.svelte";
  import { categoriesStore } from "../../../stores/categoriesStore.js";
  import { LanguageEnum } from "../../../models/languageEnum";
  // @ts-ignore
  import IconArrowUp from "@tabler/icons-svelte/IconArrowUp.svelte";
  // @ts-ignore
  import IconArrowDown from "@tabler/icons-svelte/IconArrowDown.svelte";
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";
  import { authStore } from "../../../stores/Auth.Store";
  // @ts-ignore
  import IconTrash from "@tabler/icons-svelte/IconTrash.svelte";
  // @ts-ignore
  import IconEdit from "@tabler/icons-svelte/IconEdit.svelte";
  import ConfirmDeleteModal from "$lib/components/ConfirmDeleteModal.svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";

  let items: any[] = [];
  let flag = false;
  let openModal = false;
  let itemIdToDelete: number | null = null;
  let isLoading = true;

  async function fetchData() {
    await categoriesStore.getCategoriesData(supabase);
    items = $categoriesStore[0]?.items || [];
    isLoading = false;
    flag = false;
  }

  onMount(fetchData);

  function createCategory() {
    goto("/dashboard/categories/create");
  }

  const flipDurationMs = 300;

  function handleDndConsider(e: CustomEvent) {
    items = e.detail.items;
  }

  async function handleDndFinalize(e: CustomEvent) {
    items = e.detail.items;
    flag = true;
    items.forEach((item, index: number) => {
      item.order = index + 1;
    });

    await updatePositions();
    await fetchData(); // Fetch data again after updating positions
    flag = false; // Set flag to false after data is fetched
  }

  async function updatePositions() {
    for (const item of items) {
      // Update position in table
      const { error } = await supabase
        .from("categories")
        .update({ order: item.order })
        .eq("id", item.id);

      if (error) {
        console.error("Error updating order:", error);
      }
    }
  }

  async function swapItems(indexA: number, indexB: number) {
    const tempItem = items[indexA];
    items[indexA] = items[indexB];
    items[indexB] = tempItem;
    flag = true;
    items.forEach((item, index: number) => {
      item.order = index + 1;
    });

    await updatePositions();
    await fetchData(); // Fetch data again after updating positions
    flag = false; // Set flag to false after data is fetched
  }

 let pageName: any = "category";

  function editCategory(categoryId: number) {
    goto(`/dashboard/categories/${categoryId}`);
  }

  // Function to delete a category

  async function deleteCategory() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      await categoriesStore.deleteCategoryData(itemIdToDelete, supabase);
      itemIdToDelete = null;
      await fetchData(); // Refresh data after deletion
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      openModal = false;
    }
  }
</script>

<div class="max-w-screen-2xl mx-auto py-10">
  {#if isLoading}
    <div class="flex justify-center items-center">
      <LoadingIndicator />
    </div>
  {:else}
    <!-- insert new data -->
      {#if checkUserPolicies([Policies.CREATE_CATEGORY], $authStore)}
      <InsertButton insertData={createCategory} />
    {/if}

    <!-- table data -->
    <div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
      <div class="overflow-x-auto rounded">
        <div class="min-w-full table-responsive">
          <table class="min-w-full border-collapse bg-[#d0d0d0]">
            <thead>
              <tr>
                <th
                  class="p-3 font-semibold uppercase bg-[#b0b0b0] text-[#012853] text-sm border border-gray-200 dark:border-gray-800 table-cell w-10"
                >
                  <div class="flex justify-center items-center gap-2">
                    <span>ID</span>
                  </div>
                </th>
                <th
                  class="p-3 font-semibold uppercase bg-[#b0b0b0] text-[#012853] text-sm border border-gray-200 dark:border-gray-800 table-cell w-10"
                >
                  <div class="flex justify-center items-center gap-2">
                    <span>sort</span>
                  </div>
                </th>
                <th
                  class="p-3 font-semibold uppercase bg-[#b0b0b0] text-[#012853] text-sm border border-gray-200 dark:border-gray-800 table-cell"
                >
                  <div class="flex items-start gap-2">
                    <span>Title</span>
                  </div>
                </th>
                <th
                  class="p-3 font-semibold uppercase bg-[#b0b0b0] text-[#012853] text-sm border border-gray-200 dark:border-gray-800 table-cell"
                >
                  <div class="flex items-center gap-2">
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody
              use:dndzone={{ items, flipDurationMs, dragDisabled: flag }}
              on:consider={handleDndConsider}
              on:finalize={handleDndFinalize}
            >
              {#each items as item, index (item.id)}
                <tr animate:flip={{ duration: flipDurationMs }}>
                  <td
                    class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
                  >
                    <span
                      class="flex justify-center text-[#111827] dark:text-gray-200 font-semibold"
                      >{index + 1}</span
                    >
                  </td>
                  <td
                    class="p-3 bg-gray-10 border border-gray-200 dark:border-gray-800 table-cell"
                  >
                    <span
                      class="flex justify-center text-[#111827] dark:text-gray-200 font-semibold"
                    >
                      <button
                        on:click={() => swapItems(index, index - 1)}
                        disabled={index === 0}
                      >
                        <IconArrowUp stroke={2} />
                      </button>
                      <button
                        on:click={() => swapItems(index, index + 1)}
                        disabled={index === items.length - 1}
                      >
                        <IconArrowDown stroke={2} /></button
                      >
                    </span>
                  </td>

                  <td
                    class="p-3 font- bg-gray-10 text-[#111827] dark:text-gray-300 border border-gray-200 dark:border-gray-800 table-cell"
                  >
                    {#each item.translation as lang}
                      {#if lang.language === LanguageEnum.EN}
                        <div>
                          {lang.title?.slice(0, 50)}
                        </div>
                      {/if}
                    {/each}
                  </td>
                  <td
                    class="p-3 font- bg-gray-10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 table-cell w-32"
                  >
                    {#if checkUserPolicies([Policies[`UPDATE_${pageName.toUpperCase()}`]], $authStore)}
                      <button
                        class="font-medium text-green-600 hover:underline dark:text-green-600"
                        on:click={() => editCategory(item.id)}
                      >
                        <IconEdit stroke={2} class="text-green-700" />
                      </button>
                    {/if}
                    {#if checkUserPolicies([Policies[`DELETE_${pageName.toUpperCase()}`]], $authStore)}
                      <button
                        on:click={() => {
                          itemIdToDelete = item.id;
                          openModal = true;
                        }}><IconTrash stroke={2} class="text-red-700" /></button
                      >
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  {/if}
</div>

<ConfirmDeleteModal bind:open={openModal} on:confirm={deleteCategory} />

<style>
  tbody {
    cursor: grab;
  }

  tr.dnd-placeholder {
    background-color: #f0f0f0;
  }

  tbody {
    width: 50%;
    padding: 0.3em;
    border: 1px solid black;
    overflow: scroll;
    height: 120px;
  }
</style>
