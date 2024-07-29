<script lang="ts">
  import { CreateUser_RoleRequest } from "$lib/Models/Requests/User_Role.Request.Model";
  import { onMount } from "svelte";
  import { Spinner, MultiSelect, Button } from "flowbite-svelte";
  import { goto } from "$app/navigation";
  import { CreateUserRequest } from "$lib/Models/Requests/User.Request.Model";
  import { roleStore } from "../../../../../stores/Role.Store";
  import { userStore } from "../../../../../stores/User.Store";
  import { userRoleStore } from "../../../../../stores/User_Role.Store";
  import { User_RoleDto } from "$lib/Models/DTOS/User_Role.DTO.Model";
  import { page } from "$app/stores";
  import CustomButton from "$lib/components/CustomButton.svelte";
  import { IconRefresh } from "@tabler/icons-svelte";
  import ButtonComponent from "$lib/components/ButtonComponent.svelte";
  import LabDropdown from "$lib/components/LabDropdown.svelte";

  let userOptions: CreateUserRequest = new CreateUserRequest();
  let userRoleOptions: CreateUser_RoleRequest = new CreateUser_RoleRequest();
  let password: string = "";
  let selected: string[] = [];
  let selectedLabId: number | undefined;
  let isLoading = true;

  onMount(async () => {
    try {
      await roleStore.getAll();
      const id = $page.params.id;
      const data = await userStore.get(id);

      if (data && data.id) {
        selectedLabId = data.lab;
        userOptions = {
          id: data.id,
          userName: data.userName ? data.userName : "",
          email: data.email,
          phoneNumber: data.phoneNumber,
          address: data.address,
          lab: selectedLabId,
          user_id: data.user_id,
        };

        const userRole = (await userRoleStore.getRolesByUserId(
          data.id
        )) as Array<User_RoleDto>;
        selected = userRole.map((role) => role.role_id);
      }
    } finally {
      isLoading = false;
    }
  });

  async function update(
    userOptions: CreateUserRequest,
    userRoleOptions: CreateUser_RoleRequest,
    password: string
  ) {
    isLoading = true;
    try {
      const user = await userStore.update(userOptions, password);
      if (user && user.id) {
        userRoleOptions.user_id = user.id;
        const response = await userRoleStore.updateFunction({
          user_id: user.id,
          role_ids: selected,
        });
        if (response && response.length > 0) {
          goto(`/dashboard/users`);
        }
      }
    } finally {
      isLoading = false;
      goto("/dashboard/users");
    }
  }

  function onLabSelected(event: CustomEvent) {
    selectedLabId = event.detail;
  }
</script>

<div class="max-w-screen-2xl mx-auto">
  <!-- Header Section -->
  <div class="w-full flex items-center justify-between py-4">
    <ButtonComponent title="Back" dispatch={() => history.back()} />
  </div>
  <div
    class="p-10 rounded"
    style="border: 1px solid var(--backButtonBackgroundColor);"
  >
    <div class="w-full h-auto flex justify-center items-center p-2">
      <p class="text-2xl font-bold">{"Update Employee Information"}</p>
    </div>
    <div class="flex flex-wrap py-2">
      <div class="w-full md:w-1/2 px-2 flex flex-col gap-2">
        <p class=" w-full h-4 rounded-lg">{"UserName"}</p>
        <input
          type="text"
          class="rounded-lg text-black"
          bind:value={userOptions.userName}
          required
        />
      </div>
      <div class="w-full md:w-1/2 px-2 flex flex-col gap-2">
        <p class=" w-full h-4 rounded-lg">{"Email"}</p>
        <input
          type="text"
          class="rounded-lg text-black"
          bind:value={userOptions.email}
          required
        />
      </div>
    </div>

    <div class="flex flex-wrap py-2">
      <div class="w-full md:w-1/2 px-2 flex flex-col gap-2">
        <p class=" w-full h-4 rounded-lg">{"phoneNumber"}</p>
        <input
          type="text"
          class="rounded-lg"
          style="color: var(--textColor);"
          bind:value={userOptions.phoneNumber}
          required
          placeholder="07702223744"
        />
      </div>
      <div class="w-full md:w-1/2 px-2 flex flex-col gap-2">
        <p class=" w-full h-4 rounded-lg">{"Password"}</p>
        <input
          type="password"
          class="rounded-lg text-black"
          bind:value={password}
          required
        />
      </div>
    </div>
    <div class="flex flex-col py-2 px-2 gap-2">
      <p class=" w-full h-4 rounded-lg">{"address"}</p>
      <input
        type="text"
        class="rounded-lg text-black"
        bind:value={userOptions.address}
        required
      />
    </div>
    <div class="flex flex-wrap py-2">
      <div class="w-full md:w-1/2 px-2 flex flex-col gap-2">
        <p class="w-full h-4 rounded-lg">{"Lab"}</p>
        <LabDropdown bind:selectedLabId on:labChange={onLabSelected} />
      </div>
      <div class="w-full md:w-1/2 px-2 flex flex-col gap-2">
        <p class=" w-full h-4 rounded-lg">{"Roles"}</p>
        <MultiSelect
          class="mt-2"
          items={$roleStore.data.map((role) => {
            return {
              name: role.name,
              value: role.id,
            };
          })}
          bind:value={selected}
          size="md"
        />
      </div>
    </div>

    <div class="mt-10">
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
            icon={IconRefresh}
            label="Update"
            on:click={() => {
              update(userOptions, userRoleOptions, password);
            }}
          />
        </div>
      {/if}
    </div>
  </div>
</div>
