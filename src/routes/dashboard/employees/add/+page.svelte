<script lang="ts">
  import { userRoleStore } from "./../../../../stores/User_Role.Store";
  import { CreateUser_RoleRequest } from "$lib/Models/Requests/User_Role.Request.Model";
  import { onMount } from "svelte";
  import { Button, MultiSelect, Spinner } from "flowbite-svelte";
  import { CreateUserRequest } from "$lib/Models/Requests/User.Request.Model";
  import { roleStore } from "../../../../stores/Role.Store";
  import { userStore } from "../../../../stores/User.Store";
  import UploadImage from "$lib/components/UploadImage.Component.svelte";

  let userOptions: CreateUserRequest = new CreateUserRequest();
  let userRoleOptions: CreateUser_RoleRequest = new CreateUser_RoleRequest();
  let password: string = "";
  let selected: string[] = [];

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
      const user = await userStore.create(userOptions, password);
      if (user && user.id) {
        selected.forEach(async (role_id) => {
          // console.log("User Role",role_id);
          
          userRoleOptions.role_id = role_id;
          userRoleOptions.user_id = user.id;
          await userRoleStore.create(userRoleOptions);
        });
      }
    } finally {
      isLoading = false;
    }
  }
 </script>


 

<div
  class="border border-gray-800 p-10 rounded container mx-auto px-12 mt-12 w-3/5 float-right lg:float-none flex flex-col gap-4"
>

<div class="w-full h-auto flex justify-center items-center ">
  <p class="text-xl font-bold p-2">{"Add New Employee"}</p>
</div>


  <p class="text-center">{"Add Your Image"}</p>
  <UploadImage bind:image={userOptions.image} />
  <div class="w-full flex flex-col h-auto gap-2">
    <p class=" w-full h-4 rounded-lg">{"Name"}</p>
    <input
      type="text"
      class="rounded-lg text-black"
      bind:value={userOptions.name}
      required
    />
  </div>
  <div class="w-full flex flex-col h-auto gap-2">
    <p class=" w-full h-4 rounded-lg">{"Email"}</p>
    <input
      type="text"
      class="rounded-lg text-black"
      bind:value={userOptions.email}
      required
    />
  </div>
  <div class="w-full flex flex-col h-auto gap-2">
    <p class=" w-full h-4 rounded-lg">{"Password"}</p>
    <input
      type="password"
      class="rounded-lg text-black"
      bind:value={password}
      required
    />
  </div>
  <div class="w-full flex flex-col h-auto gap-2">
    <p class=" w-full h-4 rounded-lg ">{"Roles"}</p>
 
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

  {#if isLoading}
    <button
      class="w-full h-12 bg-ekhlas-main-dark dark:bg-ekhlas-main-dark dark:hover:bg-ekhlas-main-dark duration-300 ease-in-out rounded-lg text-white"
      disabled
    >
      <Spinner class="me-3" size="4" color="white" />
      Loading ...
    </button>
  {:else}
    <Button
      class="w-full h-12  duration-300 ease-in-out rounded-lg text-white"
      on:click={() => {
        create(userOptions, userRoleOptions, password);
      }}>{"Add"}</Button>
 
  {/if}
</div>
