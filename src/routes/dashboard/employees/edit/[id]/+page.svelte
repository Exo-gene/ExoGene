<script lang="ts">
  import { CreateUser_RoleRequest } from "$lib/Models/Requests/User_Role.Request.Model";
  import { onMount } from "svelte";

  import { Spinner } from "flowbite-svelte";

  import { goto } from "$app/navigation";
  import { CreateUserRequest } from "$lib/Models/Requests/User.Request.Model";
  import UploadImage from "$lib/components/UploadImage.Component.svelte";
  import { roleStore } from "../../../../../stores/Role.Store";
  import { userStore } from "../../../../../stores/User.Store";
  import { userRoleStore } from "../../../../../stores/User_Role.Store";
  import { page } from "$app/stores";

  let userOptions: CreateUserRequest = new CreateUserRequest();
  let userRoleOptions: CreateUser_RoleRequest = new CreateUser_RoleRequest();
  let password: string = "";

  let isLoading = true;
  onMount(async () => {
    try {
      await roleStore.getAll();
      const id = $page.params.id;
      const data = await userStore.get(id);
      console.log(data);
      if(data && data.id) {
        userOptions = {
          id: data.id,
          name: data.name ? data.name : "",
          email: data.email,
          image: {
            localUrl: data.image,
            url: "",
          },
          user_id: data.id,
        };
        const userRole = await userRoleStore.getRolesByUserId(data.id);
        if(userRole && userRole[0].id) {
          userRoleOptions = {
            role_id: userRole[0].role_id,
            user_id: userRole[0].user_id,
          };
        }
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
        const response = await userRoleStore.create(userRoleOptions);
        if (response && response.id) {
          goto(`/dashboard/employees`);
        }
      }
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="w-full h-auto flex justify-center items-center mt-12">
  <p class="text-2xl font-bold dark:text-white">{"Add Employee"}</p>

  <!-- svelte-ignore a11y-missing-content -->
</div>
<div
  class="container mx-auto w-3/5 h-auto flex justify-start items-center mt-12"
>
  <a
    href="/dashboard/employees/1"
    class="rounded-lg w-24 text-center bg-[#f1f1f1] dark:bg-ekhlas-main-dark dark:text-white py-3 border-2 dark:border-black ml-5 mt-12"
    >{"back"}</a
  >
</div>

<div
  class="container mx-auto px-12 mt-12 w-3/5 float-right lg:float-none flex flex-col gap-4"
>
  <p class="text-center dark:text-white">{"Add Your Image"}</p>
  <UploadImage bind:image={userOptions.image} />
  <div class="w-full flex flex-col h-auto gap-2">
    <p class=" w-full h-4 rounded-lg dark:text-white">{"Name"}</p>
    <input
      type="text"
      class="rounded-lg dark:bg-ekhlas-main-dark dark:text-white"
      bind:value={userOptions.name}
      required
    />
  </div>
  <div class="w-full flex flex-col h-auto gap-2">
    <p class=" w-full h-4 rounded-lg dark:text-white">{"Email"}</p>
    <input
      type="text"
      class="rounded-lg dark:bg-ekhlas-main-dark dark:text-white"
      bind:value={userOptions.email}
      required
    />
  </div>
  <!-- <div class="w-full flex flex-col h-auto gap-2">
    <p class=" w-full h-4 rounded-lg dark:text-white">{"Password"}</p>
    <input
      type="password"
      class="rounded-lg dark:bg-ekhlas-main-dark dark:text-white"
      bind:value={password}
      required
    />
  </div> -->
  <div class="w-full flex flex-col h-auto gap-2">
    <p class=" w-full h-4 rounded-lg dark:text-white">{"Role"}</p>
    <select
      bind:value={userRoleOptions.role_id}
      name=""
      id=""
      class="rounded-lg dark:bg-ekhlas-main-dark dark:text-white"
      required
    >
      {#if $roleStore}
        {#each $roleStore.data as role}
          <option value={role.id}>{role.name}</option>
        {/each}
      {/if}
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
    <button
      class="w-full h-12 bg-ekhlas-primary dark:hover:bg-[#FF9300] duration-300 ease-in-out rounded-lg text-white"
      on:click={() => {
        update(userOptions, userRoleOptions, password);
      }}>{"Update"}</button
    >
  {/if}
</div>
