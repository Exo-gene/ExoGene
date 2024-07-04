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
  import { goto } from "$app/navigation";
  import LabDropdown from "$lib/components/LabDropdown.svelte";
  import ButtonComponent from "$lib/components/ButtonComponent.svelte";
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";
  import { authStore } from "../../../../stores/Auth.Store";

  let userOptions: CreateUserRequest = new CreateUserRequest();
  let userRoleOptions: CreateUser_RoleRequest = new CreateUser_RoleRequest();
  let password: string = "";
  let selected: string[] = [];
  let selectedLabId: number;

  let isLoading = true;
  onMount(async () => {
    try {
      await roleStore.getAll();
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
      userOptions.lab = selectedLabId;
      const user = await userStore.create(userOptions, password);
      if (user && user.id) {
        selected.forEach(async (role_id) => {
          userRoleOptions.role_id = role_id;
          userRoleOptions.user_id = user.id;
          await userRoleStore.create(userRoleOptions);
        });
      }
    } finally {
      isLoading = false;
      goto("/dashboard/users");
    }
  }

  function onLabSelected(event: any) {
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
    <div class="w-full h-auto flex justify-center items-center">
      <p class="text-xl font-bold p-2">{"Add New Employee"}</p>
    </div>

    <!-- Form Fields -->
    <div class="w-full">
      <!-- Row for UserName and Email -->
      <div class="flex flex-wrap py-2">
        <div class="w-full md:w-1/2 px-2 flex flex-col gap-2">
          <p class="w-full h-4 rounded-lg">{"UserName"}</p>
          <input
            type="text"
            class="rounded-lg"
            style="color: var(--textColor);"
            bind:value={userOptions.userName}
            required
          />
        </div>
        <div class="w-full md:w-1/2 px-2 flex flex-col gap-2">
          <p class="w-full h-4 rounded-lg">{"Email"}</p>
          <input
            type="text"
            class="rounded-lg"
            style="color: var(--textColor);"
            bind:value={userOptions.email}
            required
          />
        </div>
      </div>

      <div class="flex flex-wrap py-2">
        <div class="w-full md:w-1/2 px-2 flex flex-col gap-2">
          <p class="w-full h-4 rounded-lg">{"PhoneNumber"}</p>
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
          <p class="w-full h-4 rounded-lg">{"Password"}</p>
          <input
            type="password"
            class="rounded-lg"
            style="color: var(--textColor);"
            bind:value={password}
            required
          />
        </div>
      </div>

      <div class="flex flex-col py-2 px-2 gap-2">
        <p class="w-full h-4 rounded-lg">{"Address"}</p>
        <input
          type="text"
          class="rounded-lg"
          style="color: var(--textColor);"
          bind:value={userOptions.address}
        />
      </div>

      <div class="flex flex-wrap py-2">
        <div class="w-full md:w-1/2 px-2 flex flex-col gap-2">
          <p class="w-full h-4 rounded-lg">{"Lab"}</p>
          <LabDropdown {selectedLabId} on:labChange={onLabSelected} />
        </div>
        <div class="w-full md:w-1/2 px-2 flex flex-col gap-2">
          <p class="w-full h-4 rounded-lg">{"Roles"}</p>
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
              icon={IconPlus}
              label="Add"
              on:click={() => {
                create(userOptions, userRoleOptions, password);
              }}
            />
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
