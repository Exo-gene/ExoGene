<script lang="ts">
  import { userRoleStore } from "./../../../../stores/User_Role.Store";
  import { CreateUser_RoleRequest } from "$lib/Models/Requests/User_Role.Request.Model";
  import { onMount } from "svelte";
  import { MultiSelect, Spinner } from "flowbite-svelte";
  import { CreateUserRequest } from "$lib/Models/Requests/User.Request.Model";
  import { roleStore } from "../../../../stores/Role.Store";
  import { userStore } from "../../../../stores/User.Store";
  import CustomButton from "$lib/components/CustomButton.svelte";
  import { IconPlus } from "@tabler/icons-svelte";
  import { supabase } from "$lib/supabaseClient"; // Assuming you have this client set up

  let userOptions: CreateUserRequest = new CreateUserRequest();
  let userRoleOptions: CreateUser_RoleRequest = new CreateUser_RoleRequest();
  let password: string = "";
  let selected: string[] = [];
  let selectedLabId: string = "";
  let labs = [];

  let isLoading = true;
  onMount(async () => {
    try {
      await roleStore.getAll();
      const { data, error } = await supabase.from("lab").select("*");
      if (error) {
        console.error("Error fetching labs:", error);
      } else {
        labs = data;
      }
    } finally {
      isLoading = false;
    }
  });

  async function create(
    userOptions: CreateUserRequest,
    userRoleOptions: CreateUser_RoleRequest,
    password: string
  ) {
    isLoading = true;
    try {
      const user = await userStore.create(userOptions, password);
      if (user && user.id) {
        selected.forEach(async (role_id) => {
          userRoleOptions.role_id = role_id;
          userRoleOptions.user_id = user.id;
          await userRoleStore.create(userRoleOptions);
        });
        // Set the selected lab ID to user options
        userOptions.id = selectedLabId;
      }
    } finally {
      isLoading = false;
    }
  }
</script>

<div
  style="border: 1px solid var(--backButtonBackgroundColor);"
  class="p-10 rounded max-w-xl mx-auto"
>
  <div class="w-full h-auto flex justify-center items-center">
    <p class="text-xl font-bold p-2">{"Add New Employee"}</p>
  </div>

  <div class="w-full flex flex-col h-auto gap-2 py-2">
    <p class=" w-full h-4 rounded-lg">{"UserName"}</p>
    <input
      type="text"
      class="rounded-lg"
      style="color: var(--textColor);"
      bind:value={userOptions.userName}
      required
    />
  </div>
  <div class="w-full flex flex-col h-auto gap-2 py-2">
    <p class=" w-full h-4 rounded-lg">{"Email"}</p>
    <input
      type="text"
      class="rounded-lg"
      style="color: var(--textColor);"
      bind:value={userOptions.email}
      required
    />
  </div>
  <div class="w-full flex flex-col h-auto gap-2 py-2">
    <p class=" w-full h-4 rounded-lg">{"PhoneNumber"}</p>
    <input
      type="text"
      class="rounded-lg"
      style="color: var(--textColor);"
      bind:value={userOptions.phoneNumber}
      required
      placeholder="07702223744"
    />
  </div>
  <div class="w-full flex flex-col h-auto gap-2 py-2">
    <p class=" w-full h-4 rounded-lg">{"Password"}</p>
    <input
      type="password"
      class="rounded-lg"
      style="color: var(--textColor);"
      bind:value={password}
      required
    />
  </div>
  <div class="w-full flex flex-col h-auto gap-2 py-2">
    <p class=" w-full h-4 rounded-lg">{"Address"}</p>
    <input
      type="text"
      class="rounded-lg"
      style="color: var(--textColor);"
      bind:value={userOptions.address}
    />
  </div>
  <div class="w-full flex flex-col h-auto gap-2 py-2">
    <p class=" w-full h-4 rounded-lg">{"Roles"}</p>

    <MultiSelect
      items={$roleStore.data.map((role) => {
        return {
          name: role.name,
          value: role.id,
        };
      })}
      bind:value={selected}
      size="lg"
    />
  </div>
  <div class="w-full flex flex-col h-auto gap-2 py-2">
    <p class=" w-full h-4 rounded-lg">{"Lab"}</p>
    <select bind:value={selectedLabId} class="rounded-lg text-black">
      <option value="" disabled selected>Select a Lab</option>
      {#each labs as lab}
        <option value={lab.id}>{lab.labName}</option>
      {/each}
    </select>
  </div>

  {#if isLoading}
    <button
      class="w-full h-12 bg-ekhlas-main-dark dark:bg-ekhlas-main-dark dark:hover:bg-ekhlas-main-dark duration-300 ease-in-out rounded-lg text-white"
      disabled
    >
      <Spinner class="me-3" size="4" color="white" />
      Loading ...
    </button>
  {:else}
    <div class="flex justify-end mt-4">
      <CustomButton
        width="20%"
        height="3rem"
        icon={IconPlus}
        label="Add"
        on:click={() => {
          create(userOptions, userRoleOptions, password);
        }}
      />
    </div>
  {/if}
</div>
