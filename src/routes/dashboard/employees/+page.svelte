<script lang="ts">
  import { goto } from "$app/navigation";
  import InsertButton from "$lib/components/InsertButton.svelte";
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils";
  import { userStore } from "./../../../stores/User.Store";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Tooltip,
  } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { authStore } from "../../../stores/Auth.Store";

  onMount(async () => {
    // console.log("Hello from the employees page");
    await userStore.getAll();
    // console.log($userStore);
  });
</script>

<InsertButton insertData={() => goto("/dashboard/employees/add")} />
<Table shadow>
  <TableHead>
    <TableHeadCell>Image</TableHeadCell>
    <TableHeadCell>Name</TableHeadCell>
    <TableHeadCell>Email</TableHeadCell>
    {#if checkUserPolicies([Policies.DELETE_USER,Policies.UPDATE_USER], $authStore)}
    <TableHeadCell>More Info</TableHeadCell>
    {/if}
  </TableHead>
  <TableBody tableBodyClass="divide-y">
    {#each $userStore.data as user}
      <TableBodyRow>
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <TableBodyCell
          ><img
            src={user.image ?? "/images/defualt.png"}
            alt="User Image"
            class="object-cover rounded-lg w-12 h-12"
          /></TableBodyCell
        >
        <TableBodyCell>{user.name}</TableBodyCell>
        <TableBodyCell>{user.email}</TableBodyCell>
        <TableBodyCell>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div class="w-auto h-auto flex justify-center gap-2 items-center">
            {#if checkUserPolicies([Policies.UPDATE_USER], $authStore)}
              <Tooltip triggeredBy="#hover3">{"Update"}</Tooltip>
              <div
                id="hover3"
                class="w-8 h-8 flex justify-center items-center bg-blue-500 rounded-md cursor-pointer hover:bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] hover:from-[#232C46] hover:via-[#1B2237] hover:to-[#151B2B] dark:hover:bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] dark:hover:from-[#232C46] dark:hover:via-[#1B2237] dark:hover:to-[#151B2B"
              >
                <a href="/dashboard/employees/edit/{user.id}">
                  <img
                    src="/images/exclamation.png"
                    class="w-4 h-4 object-contain"
                    alt=""
                  />
                </a>
              </div>
            {/if}
            {#if checkUserPolicies([Policies.DELETE_USER], $authStore)}
              <Tooltip triggeredBy="#hover2">Delete</Tooltip>
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <button
                disabled={!checkUserPolicies(
                  [Policies.DELETE_USER],
                  $authStore
                )}
                id="hover2"
                on:click={() => {
                  userStore.delete(user.id);
                }}
                class="w-8 h-8 flex justify-center items-center bg-red-500 rounded-md cursor-pointer hover:bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] hover:from-red-500 hover:via-red-700 hover:to-red-900 dark:hover:bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] dark:hover:from-red-500 dark:hover:via-red-700 dark:hover:to-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img
                  src="/images/bin.png"
                  alt=""
                  class="w-4 h-4 object-contain"
                />
              </button>
            {/if}
          </div>
        </TableBodyCell>
      </TableBodyRow>
    {/each}
  </TableBody>
</Table>
