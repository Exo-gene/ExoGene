<script lang="ts">
  import { CreateUser_RoleRequest } from "$lib/Models/Requests/User_Role.Request.Model";
  import { onMount } from "svelte";
  import { Spinner, MultiSelect, Button } from "flowbite-svelte";
  import { goto } from "$app/navigation";
  import { CreateUserRequest } from "$lib/Models/Requests/User.Request.Model";
  import UploadImage from "$lib/components/UploadImage.Component.svelte";
  import { roleStore } from "../../../../../stores/Role.Store";
  import { userStore } from "../../../../../stores/User.Store";
  import { userRoleStore } from "../../../../../stores/User_Role.Store";
  import { User_RoleDto } from "$lib/Models/DTOS/User_Role.DTO.Model";
  import { page } from "$app/stores";

  let userOptions: CreateUserRequest = new CreateUserRequest();
  let userRoleOptions: CreateUser_RoleRequest = new CreateUser_RoleRequest();
  let password: string = "";
  let selected: string[] = [];

  let isLoading = true;
  onMount(async () => {
    try {
      await roleStore.getAll();
      const id = $page.params.id;
      const data = await userStore.get(id);
      // console.log(data);
      if (data && data.id) {
        userOptions = {
          id: data.id,
          name: data.name ? data.name : "",
          email: data.email,
          image: {
            localUrl: data.image,
            url: "",
          },
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
          goto(`/dashboard/employees`);
        }
      }
    } finally {
      isLoading = false;
    }
  }
</script>



<div
  class="border border-gray-800 p-10 rounded container mx-auto px-12 mt-12 w-3/5 float-right lg:float-none flex flex-col gap-4"
>

<div class="w-full h-auto flex justify-center items-center p-2">
  <p class="text-2xl font-bold ">{"Update Employee Information"}</p>
</div>
 
  <p class="text-center ">{"Add Your Image"}</p>
  <UploadImage bind:image={userOptions.image} />
  <div class="w-full flex flex-col h-auto gap-2">
    <p class=" w-full h-4 rounded-lg ">{"Name"}</p>
    <input
      type="text"
      class="rounded-lg text-black "
      bind:value={userOptions.name}
      required
    />
  </div>
  <div class="w-full flex flex-col h-auto gap-2">
    <p class=" w-full h-4 rounded-lg ">{"Email"}</p>
    <input
      type="text"
      class="rounded-lg text-black "
      bind:value={userOptions.email}
      required
    />
  </div>
  <div class="w-full flex flex-col h-auto gap-2">
    <p class=" w-full h-4 rounded-lg ">{"Password"}</p>
    <input
      type="password"
      class="rounded-lg text-black "
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
        update(userOptions, userRoleOptions, password);
      }}>{"Update"}</Button
    >
  {/if}
</div>
