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
  import {
    IconUserCheck,
    IconUserOff,
    IconRestore,
  } from "@tabler/icons-svelte";
  import { Button, Modal, Label, Input, Checkbox } from "flowbite-svelte";
  let formModal = false;

  interface User {
    id: number;
    userName: string;
    email: string;
    phoneNumber: number;
    address: string;
    lab_name: string;
    status: string;
    user_id: string;
    roles: {
      role_id: number;
      role_name: string;
    }[];
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

    const currentDate = new Date().toISOString(); // Get the current date in ISO format

    try {
      const { error } = await supabase
        .from("users")
        .update({ deleted_at: currentDate }) // Update the deleted_at column with the current date
        .match({ id: itemIdToDelete });

      if (error) throw error;
      fetchUsers(pageNumber, pageSize);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      openModal = false;
    }
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

  // reset password
  async function resetPassword(itemID: number) {
    console.log(itemID);
    const { error } = await supabase
      .from("users")
      .update({ password: "password" })
      .eq("id", itemID);
    if (error) {
      console.error("Error resetting password:", error);
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
      <ButtonComponent title="Add" dispatch={() => createEmployee()} />
      {#if checkUserPolicies([Policies.CREATE_USER], $authStore)}{/if}
    </div>

    <!-- Table data -->
    <div class="max-w-screen-2xl mx-auto px-4 lg:px-0">
      <div
        class="overflow-x-auto"
        style="background-color: var(--mainBackgroundColor);color: var(--titleColor);border:1px solid #686868;"
      >
        <div class="min-w-full table-responsive">
          <table class="min-w-full table-fixed">
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
                  class="p-3 font-semibold uppercase bg-[#b0b0b0] text-[#012853] text-sm w-1/6"
                >
                  <div class="flex justify-start items-start gap-2">
                    <span>Role</span>
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
                  <td class="p-3 table-cell-bottom-border">
                    <span class="flex justify-start">
                      {item.id}
                    </span>
                  </td>
                  <td class="p-3 table-cell-bottom-border">
                    <span class="flex justify-start">
                      {item.userName}
                    </span>
                  </td>
                  <td class="p-3 table-cell-bottom-border">
                    <span class="flex justify-start">
                      {item.email}
                    </span>
                  </td>
                  <td class="p-3 table-cell-bottom-border">
                    <span class="flex justify-start">
                      {item.phoneNumber}
                    </span>
                  </td>

                  <td class="p-3 table-cell-bottom-border">
                    <span class="flex justify-start">
                      {item.lab_name}
                    </span>
                  </td>
                  <td class="p-3 table-cell-bottom-border">
                    <span class="flex justify-start">
                      {item.address}
                    </span>
                  </td>
                  <td class="p-3 table-cell-bottom-border">
                    <span class="flex justify-start">
                      {#each item.roles as role}
                        {role.role_name}
                      {/each}
                    </span>
                  </td>
                  <td class="p-3 table-cell-bottom-border">
                    <span class="space-x-3 flex justify-end">
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

                      <!-- reset password  -->
                      {#if checkUserPolicies([Policies[`RESETPASSWORD_${pageName.toUpperCase()}`]], $authStore)}
                        <button
                          class="text-gray-700 font-semibold hover:text-gray-600 transition-all"
                          on:click={() => (formModal = true)}
                        >
                          <IconRestore stroke={2} />
                        </button>
                      {/if}

                      <Modal
                        bind:open={formModal}
                        size="xs"
                        autoclose={false}
                        class="w-full"
                      >
                        <form class="flex flex-col space-y-6" action="#">
                          <h3
                            class="mb-4 text-xl font-medium text-gray-900 dark:text-white"
                          >
                            Reset password
                          </h3>
                          <Label class="space-y-2">
                            <span>Your password</span>
                            <Input
                              type="password"
                              name="password"
                              placeholder="•••••••"
                              required
                            />
                          </Label>

                          <Button
                            on:click={() => {
                              resetPassword(item.id);
                            }}
                            type="submit"
                            class="w-full1">Reset password</Button
                          >
                        </form>
                      </Modal>
                      <!-- reset password  -->
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

<style>
  .table-cell-bottom-border {
    border-bottom: 1px solid var(--textColor);
  }
</style>
