<script lang="ts">
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
  import { Supabase } from "$lib/Supabase/Supabase.Client";

  let userOptions: CreateUserRequest = new CreateUserRequest();
  let password: string = "";
  let selected: number[] = [];
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
    password: string,
    selectedRoles: number[]
  ) {
    isLoading = true;
    try {
      userOptions.lab = selectedLabId;
      const user = await userStore.create(userOptions, password);
      if (user && user.id) {
        const response = await Supabase.client.rpc("create_roles", {
          _user_id: user.id,
          _role_ids: selectedRoles,
        });

        if (response.error) {
          console.error("RPC call failed:", response.error);
        } else {
          console.log("Roles assigned to user:", response.data);
          goto("/dashboard/users");
        }
      }
    } catch (error) {
      console.error("Error creating user or assigning roles:", error);
    } finally {
      isLoading = false;
    }
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
         <LabDropdown bind:selectedLabId />
        </div>
        <div class="w-full md:w-1/2 px-2 flex flex-col gap-2">
          <p class="w-full h-4 rounded-lg">{"Roles"}</p>
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
                create(userOptions, password, selected);
              }}
            />
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
