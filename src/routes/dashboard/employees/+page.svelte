<script lang="ts">
  import ConfirmDeleteModal from "$lib/components/ConfirmDeleteModal.svelte";
  import { goto } from "$app/navigation";
  import InsertButton from "$lib/components/InsertButton.svelte";
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils";
  import { userStore } from "./../../../stores/User.Store";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";
  import { onMount } from "svelte";
  import { authStore } from "../../../stores/Auth.Store";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  // @ts-ignore
  import IconTrash from "@tabler/icons-svelte/IconTrash.svelte";
  // @ts-ignore
  import IconEdit from "@tabler/icons-svelte/IconEdit.svelte";

  let itemIdToDelete: any | null = null;
  let isLoading = true;
  let userData: any = [];
  let openModal = false;
  let pageName: string = "user";
  $: userData = $userStore?.data || [];

  onMount(async () => {
    await userStore.getAll();
    isLoading = false;
    userData = $userStore?.data || [];
  });

  function editEmployee(userId: number) {
    goto(`/dashboard/employees/edit/${userId}`);
  }

  async function deleteEmployee() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      userStore.delete(itemIdToDelete);
      itemIdToDelete = null;
      await userStore.getAll(); // Refresh data after deletion
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
    {#if checkUserPolicies([Policies.CREATE_USER], $authStore)}
      <InsertButton insertData={() => goto("/dashboard/employees/add")} />
    {/if}

    <!-- table data -->
    <div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
      <div class="overflow-x-auto">
        <div class="min-w-full table-responsive">
          <table class="min-w-full table-fixed bg-[#d0d0d0]">
            <thead>
              <tr>
                <th
                  class="p-3 font-semibold uppercase bg-[#b0b0b0] text-[#012853] text-sm w-1/3"
                >
                  <div class="flex justify-start items-start gap-2">
                    <span>Name</span>
                  </div>
                </th>
                <th
                  class="p-3 font-semibold uppercase bg-[#b0b0b0] text-[#012853] text-sm w-1/3"
                >
                  <div class="flex justify-start items-start gap-2">
                    <span>Email</span>
                  </div>
                </th>
                <th
                  class="p-5 font-semibold uppercase bg-[#b0b0b0] text-[#012853] text-sm w-1/3"
                >
                  <div class="flex justify-end items-end gap-2">
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {#each $userStore.data as item, index (item.id)}
                <tr>
                  <td class="p-3 bg-gray-10 border-b-2">
                    <span
                      class="flex justify-start text-[#111827] dark:text-gray-200 font-semibold"
                    >
                      {item.name}
                    </span>
                  </td>
                  <td class="p-3 bg-gray-10 border-b-2">
                    <span
                      class="flex justify-start text-[#111827] dark:text-gray-200 font-semibold"
                    >
                      {item.email}
                    </span>
                  </td>
                  <td class="p-5 bg-gray-10 border-b-2">
                    <span
                      class="flex justify-end text-[#111827] dark:text-gray-200 font-semibold"
                    >
                      {#if checkUserPolicies([Policies[`UPDATE_${pageName.toUpperCase()}`]], $authStore)}
                        <button
                          class="font-medium text-green-600 hover:underline dark:text-green-600"
                          on:click={() => editEmployee(item.id)}
                        >
                          <IconEdit stroke={2} class="text-green-700" />
                        </button>
                      {/if}
                      {#if checkUserPolicies([Policies[`DELETE_${pageName.toUpperCase()}`]], $authStore)}
                        <button
                          on:click={() => {
                            itemIdToDelete = item.id;
                            openModal = true;
                          }}
                        >
                          <IconTrash stroke={2} class="text-red-700" />
                        </button>
                      {/if}
                    </span>
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

<ConfirmDeleteModal bind:open={openModal} on:confirm={deleteEmployee} />
