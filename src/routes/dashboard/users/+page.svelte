<script lang="ts">
  import ConfirmDeleteModal from "$lib/components/ConfirmDeleteModal.svelte";
  import { goto } from "$app/navigation";
  import ButtonComponent from "$lib/components/ButtonComponent.svelte";
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";
  import { onMount } from "svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import { IconEdit, IconTrash, IconUserX } from "@tabler/icons-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { authStore } from "../../../stores/Auth.Store";
  import PaginationControls from "$lib/components/PaginationControls.svelte";
  import { IconUserCheck, IconUserOff } from "@tabler/icons-svelte";

  interface User {
    id: number;
    userName: string;
    email: string;
    phoneNumber: number;
    address: string;
    lab: number;
    status: string;
    user_id: string;
  }

  let itemIdToDelete: number | null = null;
  let isLoading = true;
  let userData: User[] = [];
  let openModal = false;
  let pageName = "user";
  let pageNumber = 1;
  let pageSize = 3;
  let totalPages = 0;
  let totalItems = 0;

  async function fetchUsers(pageNumber: number, pageSize: number) {
    isLoading = true;
    const { data, error } = await supabase.rpc("get_users_paginated", {
      page_number: pageNumber,
      page_size: pageSize,
    });
    console.log(data);

    if (error) {
      console.error("Error fetching users:", error);
      userData = [];
    } else {
      totalItems = data.count;
      totalPages = Math.ceil(totalItems / pageSize);
      userData = data.items;
    }
    isLoading = false;
  }

  onMount(() => {
    fetchUsers(pageNumber, pageSize);
  });

  function editEmployee(userId: number) {
    goto(`/dashboard/users/edit/${userId}`);
  }

  async function deleteEmployee() {
    if (itemIdToDelete === null) {
      console.error("No item ID specified for deletion");
      return;
    }
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .match({ id: itemIdToDelete });
      if (error) throw error;
      fetchUsers(pageNumber, pageSize); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      openModal = false;
    }
  }

  async function getLabTitle(labId: number) {
    const { data, error } = await supabase
      .from("lab")
      .select("lab_name")
      .eq("id", labId)
      .single();
    if (error) {
      console.error("Error fetching lab:", error);
      return "Unknown Lab";
    }
    return data.lab_name;
  }

  function createEmployee() {
    goto("/dashboard/users/add");
  }

  function previousPage() {
    if (pageNumber > 1) {
      pageNumber -= 1;
      fetchUsers(pageNumber, pageSize);
    }
  }

  function nextPage() {
    if (pageNumber < totalPages) {
      pageNumber += 1;
      fetchUsers(pageNumber, pageSize);
    }
  }

  async function changeUserStatus(itemID: number) {
    // Fetch the current status of the user
    let { data: users, error } = await supabase
      .from("users")
      .select("status")
      .eq("id", itemID);

    if (error) {
      console.error("Error fetching user:", error);
      return;
    }

    // Determine the new status based on the current one
    const newStatus = users[0]!.status === "true" ? "false" : "true";

    // Update the user's status in the database
    const { error: updateError } = await supabase
      .from("users")
      .update({ status: newStatus })
      .eq("id", itemID);

    if (updateError) {
      console.error("Error updating user status:", updateError);
    } else {
      // Refresh the user data to reflect the new status
      fetchUsers(pageNumber, pageSize);
    }
  }
</script>

<div class="max-w-screen-2xl mx-auto py-10">
  {#if isLoading}
    <div class="flex justify-center items-center">
      <LoadingIndicator />
    </div>
  {:else}
    <!-- Header Section -->
    <div class="w-full flex items-center justify-between py-4">
      <ButtonComponent title="Back" dispatch={() => history.back()} />
      <h1
        class="font-bold text-center flex-grow"
        style="color: var(--titleColor);"
      >
        Users List
      </h1>
      <!-- insert new data -->
      {#if checkUserPolicies([Policies.CREATE_USER], $authStore)}
        <ButtonComponent title="Add" dispatch={() => createEmployee()} />
      {/if}
    </div>

    <!-- Table data -->
    <div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
      <div class="overflow-x-auto">
        <div class="min-w-full table-responsive">
          <table class="min-w-full table-fixed bg-[#d0d0d0]">
            <thead>
              <tr>
                <th
                  class="p-3 font-semibold uppercase bg-[#b0b0b0] text-[#012853] text-sm w-1/6"
                >
                  <div class="flex justify-start items-start gap-2">
                    <span>ID</span>
                  </div>
                </th>
                <th
                  class="p-3 font-semibold uppercase bg-[#b0b0b0] text-[#012853] text-sm w-1/6"
                >
                  <div class="flex justify-start items-start gap-2">
                    <span>User Name</span>
                  </div>
                </th>
                <th
                  class="p-3 font-semibold uppercase bg-[#b0b0b0] text-[#012853] text-sm w-1/6"
                >
                  <div class="flex justify-start items-start gap-2">
                    <span>Email</span>
                  </div>
                </th>
                <th
                  class="p-3 font-semibold uppercase bg-[#b0b0b0] text-[#012853] text-sm w-1/6"
                >
                  <div class="flex justify-start items-start gap-2">
                    <span>Phone Number</span>
                  </div>
                </th>
                <th
                  class="p-3 font-semibold uppercase bg-[#b0b0b0] text-[#012853] text-sm w-1/6"
                >
                  <div class="flex justify-start items-start gap-2">
                    <span>Lab</span>
                  </div>
                </th>
                <th
                  class="p-3 font-semibold uppercase bg-[#b0b0b0] text-[#012853] text-sm w-1/6"
                >
                  <div class="flex justify-start items-start gap-2">
                    <span>Address</span>
                  </div>
                </th>
                <th
                  class="p-5 font-semibold uppercase bg-[#b0b0b0] text-[#012853] text-sm w-1/6"
                >
                  <div class="flex justify-end items-end gap-2">
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {#each userData as item (item.id)}
                <tr>
                  <td class="p-3 bg-gray-10 border-b-2">
                    <span
                      class="flex justify-start text-[#111827] dark:text-gray-200"
                    >
                      {item.id}
                    </span>
                  </td>
                  <td class="p-3 bg-gray-10 border-b-2">
                    <span
                      class="flex justify-start text-[#111827] dark:text-gray-200"
                    >
                      {item.userName}
                    </span>
                  </td>
                  <td class="p-3 bg-gray-10 border-b-2">
                    <span
                      class="flex justify-start text-[#111827] dark:text-gray-200"
                    >
                      {item.email}
                    </span>
                  </td>
                  <td class="p-3 bg-gray-10 border-b-2">
                    <span
                      class="flex justify-start text-[#111827] dark:text-gray-200"
                    >
                      {item.phoneNumber}
                    </span>
                  </td>

                  <td class="p-3 bg-gray-10 border-b-2">
                    <span
                      class="flex justify-start text-[#111827] dark:text-gray-200"
                    >
                      {#await getLabTitle(item.lab) then labTitle}
                        {labTitle}
                      {:catch}
                        Unknown Lab
                      {/await}
                    </span>
                  </td>
                  <td class="p-3 bg-gray-10 border-b-2">
                    <span
                      class="flex justify-start text-[#111827] dark:text-gray-200"
                    >
                      {item.address}
                    </span>
                  </td>
                  <td class="p-5 bg-gray-10 border-b-2">
                    <span
                      class="space-x-3 flex justify-end text-[#111827] dark:text-gray-200"
                    >
                      {#if checkUserPolicies([Policies[`UPDATE_${pageName.toUpperCase()}`]], $authStore)}
                        <button
                          class="font-medium text-green-600 hover:underline dark:text-green-600"
                          on:click={() => editEmployee(item.id)}
                        >
                          <IconEdit
                            stroke={2}
                            class="text-green-700 hover:text-green-600 transition-all"
                          />
                        </button>
                      {/if}
                      {#if checkUserPolicies([Policies[`DELETE_${pageName.toUpperCase()}`]], $authStore)}
                        <button
                          on:click={() => {
                            itemIdToDelete = item.id;
                            openModal = true;
                          }}
                        >
                          <IconTrash
                            stroke={2}
                            class="text-red-700 hover:text-red-600 transition-all"
                          />
                        </button>
                      {/if}
                      {#if checkUserPolicies([Policies[`DISABLED_${pageName.toUpperCase()}`]], $authStore)}
                        {#if item.status === "true"}
                          <button
                            class="text-blue-700 font-semibold hover:text-blue-600 transition-all"
                            on:click={() => changeUserStatus(item.id)}
                          >
                            <IconUserCheck stroke={2} />
                          </button>
                        {:else}
                          <button
                            class="text-gray-700 font-semibold hover:text-gray-600 transition-all"
                            on:click={() => changeUserStatus(item.id)}
                          >
                            <IconUserOff stroke={2} />
                          </button>
                        {/if}
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
  <PaginationControls
    currentPage={pageNumber}
    {totalPages}
    {previousPage}
    {nextPage}
  />
</div>

<ConfirmDeleteModal bind:open={openModal} on:confirm={deleteEmployee} />
