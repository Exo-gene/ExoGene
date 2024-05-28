<script lang="ts">
  import { sineIn } from "svelte/easing";
  import {
    Modal,
    Button,
    Input,
    Drawer,
    CloseButton,
    Label,
    MultiSelect,
    Spinner,
  } from "flowbite-svelte";
  import {
    ExclamationCircleOutline,
    SearchOutline,
  } from "flowbite-svelte-icons";
  import { onMount } from "svelte";
  import type { PolicyDto } from "$lib/Models/DTOS/Policy.DTO.Model";
  import { CreateRoleRequest } from "$lib/Models/Requests/Role.Request.Model";
  import { RoleDto } from "$lib/Models/DTOS/Role.DTO.Model";
  import { policyStore } from "../../../stores/Policy.Store";
  import { roleStore } from "../../../stores/Role.Store";
  import { roleActionStore } from "../../../stores/Role_Action.Store";
  export let isLoading: boolean = true;

  export let roleModal: boolean = false;
  let selectedRolePolicies: {
    id: string;
    name: string;
    policies: Array<PolicyDto>;
  } = {
    id: "",
    name: "",
    policies: new Array<PolicyDto>(),
  };
  let deleteModal: boolean = false;
  let roleOptions: CreateRoleRequest = new CreateRoleRequest();
  let selectedPolicies: Array<string> = new Array<string>();
  let drawerCondition: boolean = true;
  let transitionParams = {
    x: 320,
    duration: 200,
    easing: sineIn,
  };
  let groupedPolicies: {
    [key: string]: PolicyDto[]; // This means the keys are strings and the values are arrays of PolicyDto
  } = {};
  const actionRegex: RegExp = /^\w+_(\w+)$/;
  let roleData: RoleDto = new RoleDto();

  onMount(async () => {
    try {
      await policyStore.getAll();
      await roleStore.getAll();
      await roleActionStore.getAll();
      //   console.log("RoleActions",$roleActionStore.data);
    } finally {
      isLoading = false;
    }
  });

  async function filterPolicies() {
    await policyStore.getAll();
    groupByCategory($policyStore.data);
  }

  function groupByCategory(policies: PolicyDto[]) {
    groupedPolicies = {};
    policies.forEach((policy) => {
      const categoryName = policy.name.match(actionRegex)![1];
      // Initialize the category array if it doesn't exist
      if (!groupedPolicies[categoryName]) {
        groupedPolicies[categoryName] = [];
      }
      // Push the policy to the category array
      groupedPolicies[categoryName].push(policy);
    });
    console.log("GroupedPolicies", groupedPolicies);
    return groupedPolicies;
  }

  async function createOrUpdate(options: CreateRoleRequest) {
    isLoading = true;
    try {
      const response = options.id
        ? await roleStore.update(options)
        : await roleStore.create(options);
      if (response && response.id) {
        const response_2 = await roleActionStore.updateFunction({
          role_id: response.id + "",
          policies_ids: selectedPolicies,
        });
        if (response_2 && response_2.length > 0) {
          roleOptions = new CreateRoleRequest();
          selectedPolicies = [];
          selectedRolePolicies = {
            id: "",
            name: "",
            policies: [],
          };
        }
      }
    } finally {
      isLoading = false;
    }
  }

  async function updateRole(options: CreateRoleRequest) {
    isLoading = true;
    try {
      const response = await roleActionStore.updateFunction({
        role_id: options.id + "",
        policies_ids: selectedRolePolicies.policies.map((policy) => policy.id),
      });
      if (response && response.length > 0) {
        roleOptions = new CreateRoleRequest();
        selectedPolicies = [];
        selectedRolePolicies = {
          id: "",
          name: "",
          policies: [],
        };
      }
    } finally {
      isLoading = false;
    }
  }

  let selectAllStates: any = {};

  function handleSelectAll(policyCategory: string, checked: boolean) {
    selectAllStates[policyCategory] = checked;
    if (checked) {
      const newPolicies = groupedPolicies[policyCategory].filter(
        (policy) =>
          !selectedRolePolicies.policies.some((p) => p.id === policy.id)
      );
      selectedRolePolicies.policies = [
        ...selectedRolePolicies.policies,
        ...newPolicies,
      ];
    } else {
      selectedRolePolicies.policies = selectedRolePolicies.policies.filter(
        (policy) => {
          return !groupedPolicies[policyCategory].some(
            (p) => p.id === policy.id
          );
        }
      );
    }
  }

  async function deleteRole(id: string) {
    isLoading = true;
    try {
      await roleStore.delete(id);
    } catch (error) {
      console.log(error);
    } finally {
      roleData = new RoleDto();
      deleteModal = false;
      isLoading = false;
    }
  }

  async function getPoliciesForRole(id: string) {
    isLoading = true;
    try {
      const response = await roleActionStore.getRoleActionsByRole(id);
      selectedRolePolicies.policies = response?.map((roleAction) => {
        return {
          id: roleAction.policies?.id,
          name: roleAction.policies?.name,
        };
      }) as Array<PolicyDto>;

      groupByCategory($policyStore.data);
      return selectedRolePolicies.policies.map((policy) => policy.id);
    } finally {
      isLoading = false;
    }
  }
  // $: {
  //   if (
  //     roleCreateOptions.name == "" ||
  //     roleCreateOptions.policies.length == 0 ||
  //     isLoading
  //   ) {
  //     roleCreateOptions.id = "";
  //   }
  // }
</script>

<Modal
  title="Add your Policies"
  bind:open={roleModal}
  backdropClass="h-80 dark:bg-white"
  class="h-[530px] w-96 "
  classDialog=" backdrop-blur-lg "
  bodyClass="dark:bg-white rounded-lg rounded-lg"
>
  <div class="w-full h-auto flex flex-wrap gap-3">
    <div class="w-full z-50 flex flex-row h-auto">
      <select
        class="w-full rounded-tl-lg rounded-bl-lg h-10 dark:border-white"
        bind:value={selectedRolePolicies}
        on:change={async () => {
          await getPoliciesForRole(selectedRolePolicies.id);
          roleOptions = {
            id: selectedRolePolicies.id,
            name: selectedRolePolicies.name,
          };
          selectedPolicies = selectedRolePolicies.policies.map(
            (policy) => policy.id
          );
        }}
      >
        {#if $roleStore}
          {#each $roleStore.data as role}
            <option value={{ id: role.id, name: role.name }} selected
              >{role.name}</option
            >
          {/each}
        {/if}
      </select>
      <button
        class="bg-[#2A3551] hover:bg-[#1e263a] dark:hover:bg-[#2d2d2d] hover:text-blue-500 w-20 h-10 rounded-tr-lg rounded-br-lg text-xl font-bold text-white transition-all text-center bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#191919] via-[#2d2d2d] to-[#05070c]"
        on:click={() => (drawerCondition = false)}>+</button
      >
    </div>

    <form class="w-full">
      <Input
        id="search"
        placeholder="Search"
        size="lg"
        class="w-full dark:bg-ekhlas-table-light dark:border-ekhlas-main-light "
      >
        <SearchOutline
          slot="left"
          class="w-6 h-6 text-gray-500 dark:text-gray-400"
        />
        <Button
          slot="right"
          size="sm"
          type="submit"
          class="bg-ekhlas-primary hover:bg-[#ec945d] ease-in-out duration-300"
          on:click={filterPolicies}>{"search"}</Button
        >
      </Input>
    </form>

    {#if selectedRolePolicies.policies}
      <div
        class="w-full h-60 flex flex-col gap-5 justify-start items-start bg-[#f1f1f1] dark:bg-ekhlas-background-dark rounded-lg p-4 text-black overflow-y-auto"
      >
        {#each Object.keys(groupedPolicies) as policyCategory}
          <div
            class=" text-center w-full h-auto flex flex-col justify-between items-center bg-ekhlas-main-dark dark:bg-ekhlas-primary rounded-lg pt-2"
          >
            <div
              class=" text-center w-full h-auto flex justify-between items-center"
            >
              <p class=" w-full font-medium px-2 text-sm uppercase text-white">
                Policies of {policyCategory}
              </p>
              <div
                class="w-full h-auto flex justify-end gap-2 items-center text-white"
              >
                <p class="text-sm">Select All</p>
                <input
                  type="checkbox"
                  bind:checked={selectAllStates[policyCategory]}
                  on:change={() =>
                    handleSelectAll(
                      policyCategory,
                      selectAllStates[policyCategory]
                    )}
                />
              </div>
            </div>
            <hr class="border-2 w-full mt-2 dark:border-ekhlas-main-light" />
          </div>

          {#each groupedPolicies[policyCategory] as policy}
            <div class="flex w-60 h-auto justify-start items-start gap-2">
              <input
                type="checkbox"
                checked={selectedRolePolicies.policies.some(
                  (p) => p.id === policy.id
                )}
                value={policy.id}
                on:change={() => {
                  if (
                    selectedRolePolicies.policies.some(
                      (p) => p.id === policy.id
                    )
                  ) {
                    selectedRolePolicies.policies =
                      selectedRolePolicies.policies.filter(
                        (p) => p.id !== policy.id
                      );
                  } else {
                    selectedRolePolicies.policies = [
                      ...selectedRolePolicies.policies,
                      policy,
                    ];
                  }
                }}
              />
              <p class="text-justify dark:text-white">
                {policy.name.replace(/_/g, " ")}
              </p>
            </div>
          {/each}
        {/each}
      </div>
    {/if}
  </div>

  {#if isLoading}
    <div class="w-full h-auto flex justify-center items-center gap-3">
      <Button
        disabled
        class="bg-ekhlas-ekhlas-main-dark hover:bg-ekhlas-main-dark ease-in-out duration-300 gap-3"
        >{"Update"}
        <Spinner color="red" />
      </Button>

      <!-- <Button color="alternative">Decline</Button> -->
    </div>
  {:else if selectedRolePolicies.policies}
    <div class="w-full h-auto flex justify-center items-center gap-3">
      <Button
        on:click={() => updateRole(roleOptions)}
        class="bg-blue-600 hover:bg-[#ed9243] ease-in-out duration-300"
        >{"Update"}</Button
      >
      <!-- <Button color="alternative">Decline</Button> -->
    </div>
  {/if}
</Modal>

<Drawer
  transitionType="fly"
  placement="right"
  {transitionParams}
  bind:hidden={drawerCondition}
  class="w-1/3 dark:bg-white dark:text-white"
>
  <CloseButton
    on:click={() => (drawerCondition = true)}
    class="mb-4 dark:text-white"
  />
  <form action="#" class="mb-6">
    <div class="w-full flex justify-center items-center gap-2">
      <div class="mb-6 w-full">
        <Label for="title" class="block mb-2">{"title"}</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="Role Title"
          bind:value={roleOptions.name}
        />
      </div>
      {#if roleOptions.id}
        <div
          class="w-24 bg-red-600 h-9 flex justify-center items-center p-4 rounded-xl"
        >
          <button
            on:click={() => {
              roleOptions = new CreateRoleRequest();
              selectedPolicies = [];
              selectedRolePolicies = {
                id: "",
                name: "",
                policies: [],
              };
            }}>Remove</button
          >
        </div>
      {/if}
    </div>
    <div class="mb-6">
      <Label for="description" class="mb-2">{"policies"}</Label>
      <MultiSelect
        items={$policyStore
          ? $policyStore.data.map((policy) => {
              return {
                value: policy.id,
                name: policy.name.replace(/_/g, " "),
              };
            })
          : []}
        bind:value={selectedPolicies}
        required
        size="lg"
      />
    </div>
  </form>
  {#if isLoading}
    <div class="w-full flex flex-wrap items-center gap-2">
      <Button class="w-full" disabled>
        <Spinner class="me-3" size="4" color="white" />
        Loading ...
      </Button>
    </div>
  {:else}
    <Button
      on:click={() => createOrUpdate(roleOptions)}
      class="bg-ekhlas-primary hover:bg-[#ed9e5a] ease-in-out duration-300 w-full"
    >
      {"submit"}</Button
    >
  {/if}
  <div
    class="w-full h-[40rem] bg-[#f1f1f1] dark:bg-ekhlas-main-dark mt-4 rounded-lg flex justify-start items-center flex-col px-2"
  >
    <p class="text-center dark:text-white w-full h-auto mt-4 mb-8">
      Roles List
    </p>
    <div
      class="w-full h-[40rem] bg-[#f1f1f1] dark:bg-ekhlas-main-dark overflow-y-auto"
    >
      {#if $roleStore}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        {#each $roleStore.data as role}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="w-full h-12 bg-white dark:bg-white rounded-lg flex justify-between items-center px-4 mt-2 overflow-y-auto"
          >
            <p class="dark:text-white">{role.name}</p>

            <div
              class=" w-auto h-8 rounded-lg flex justify-center items-center gap-5"
            >
              <div
                on:click={async () => {
                  roleOptions = {
                    id: role.id,
                    name: role.name,
                  };
                  selectedPolicies = $roleActionStore.data.map((roleAction) => {
                    if (roleAction.role_id === role.id) {
                      return roleAction.policy_id;
                    } else {
                      return "";
                    }
                  });
                }}
                class="bg-green-500 w-8 h-8 rounded-lg flex justify-center items-center cursor-pointer"
              >
                <img
                  src="/images/edit.png"
                  alt=""
                  class="w-5 h-5 object-contain"
                />
              </div>
              <div
                on:click={() => {
                  deleteModal = true;
                  roleData = role;
                }}
                class="bg-red-500 w-8 h-8 rounded-lg flex justify-center items-center cursor-pointer"
              >
                <img
                  src="/images/bin.png"
                  alt=""
                  class="w-6 h-6 object-contain"
                />
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</Drawer>

<Modal size="lg" bind:open={deleteModal} bodyClass="dark:bg-white rounded-lg">
  <div class="text-center">
    <ExclamationCircleOutline
      class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
    />
    <div class="mb-5 text-lg font-normal dark:text-white">
      {"areYouSureYouWantToDelete"}{"role"}{"questionMark"}
      {#if isLoading}
        <div class="w-full flex flex-wrap items-center gap-2">
          <Button class="w-full" disabled>
            <Spinner class="me-3" size="4" color="white" />
            Loading ...
          </Button>
        </div>
      {:else}
        <div class="w-full flex justify-center items-center gap-3">
          <Button
            class="me-2 bg-ekhlas-primary p-2 w-full h-12"
            on:click={() => {
              deleteRole(roleData.id);
            }}>{"yesImSure"}</Button
          >
          <Button
            class="w-full h-12"
            color="red"
            on:click={() => {
              deleteModal = false;
              roleData = new RoleDto();
            }}>{"noCancel"}</Button
          >
        </div>
      {/if}
    </div>
  </div></Modal
>

<style>
  input[type="checkbox"] {
    border-radius: 12px;
    width: 1.5em;
    height: 1.5em;
    margin-right: 0.65rem;
    border: 2px solid #2d2d2d;
  }
  input[type="checkbox"]:checked {
    background-color: #2d2d2d;
  }
</style>
