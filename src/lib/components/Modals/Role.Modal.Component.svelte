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
    Select,
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
  import {
    IconEdit,
    IconPlus,
    IconRefresh,
    IconTrash,
  } from "@tabler/icons-svelte";
  import CustomButton from "../CustomButton.svelte";

  export let isLoadingToRole: boolean = true;
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
    [key: string]: PolicyDto[];
  } = {};
  const actionRegex: RegExp = /^\w+_(\w+)$/;
  let roleData: RoleDto = new RoleDto();
  let searchTerm = "";

  onMount(async () => {
    try {
      await policyStore.getAll();
      await roleStore.getAll();
      await roleActionStore.getAll();
    } finally {
      isLoadingToRole = false;
    }
  });
  function filterPolicies() {
    const filteredPolicies = $policyStore.data.filter((policy) =>
      policy.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    groupByCategory(filteredPolicies);
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
    return groupedPolicies;
  }

  async function createOrUpdate(options: CreateRoleRequest) {
    isLoadingToRole = true;
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
      isLoadingToRole = false;
    }
  }

  async function updateRole(options: CreateRoleRequest) {
    isLoadingToRole = true;
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
      isLoadingToRole = false;
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
    isLoadingToRole = true;
    try {
      await roleStore.delete(id);
    } catch (error) {
      console.log(error);
    } finally {
      roleData = new RoleDto();
      deleteModal = false;
      isLoadingToRole = false;
    }
  }

  async function getPoliciesForRole(id: string) {
    isLoadingToRole = true;
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
      isLoadingToRole = false;
    }
  }
</script>

<Modal
  style="background-color: var(--mainBackgroundColor); color: var(--titleColor);"
  title="Add your Policies"
  bind:open={roleModal}
  backdropClass="h-80"
  class="h-[600px] max-w-screen-lg mx-auto shadow"
  classDialog="backdrop-blur-lg"
  bodyClass=" "
>
  <div class="w-full mt-4 h-auto flex flex-wrap gap-3">
    <Label class="mx-4" style="color:var(--textColor)">Select role</Label>
    <div class="w-full z-50 flex flex-row h-auto mx-4">
      <Select
        style="background-color: var(--textColor);color: var(--buttonBackgroundColor);"
        class="cursor-pointer w-full mr-2 border-gray-400 h-12 rounded"
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
            <option value={{ id: role.id, name: role.name }} selected>
              {role.name}
            </option>
          {/each}
        {/if}
      </Select>

      <button
        class="font-semibold w-40 rounded"
        style="background-color: var(--backButtonBackgroundColor);color: var(--titleColor);"
        on:click={() => (drawerCondition = false)}
        >{"Add New Role"}
      </button>
    </div>

    <form class="mx-5 w-full" on:submit|preventDefault={filterPolicies}>
      <Input
        id="search"
        placeholder="Search"
        bind:value={searchTerm}
        size="lg"
        class="w-full  "
        style="background-color: var(--textColor);color: var(--buttonBackgroundColor);"
      >
        <SearchOutline slot="left" class="w-6 h-6 text-var(--iconColor)" />
        <Button
          slot="right"
          size="sm"
          type="submit"
          style="background-color: var(--backButtonBackgroundColor);color: var(--titleColor);"
          class="ease-in-out duration-300"
        >
          {"Search"}
        </Button>
      </Input>
    </form>

    {#if selectedRolePolicies.policies}
      <div
        class="w-full h-60 flex flex-col gap-5 justify-start items-start m-4 rounded-lg p-4 text-var(--textColor) overflow-y-auto"
      >
        {#each Object.keys(groupedPolicies) as policyCategory}
          <div
            style="background-color: var(--backgroundButtonColor);color: var(--textColor);"
            class=" p-2 w-full h-auto flex flex-col justify-between items-center rounded"
          >
            <div class=" w-full h-auto flex justify-between items-center">
              <p class="w-full font-medium px-2 text-sm uppercase">
                Policies of {policyCategory}
              </p>
              <div class="w-full h-auto flex justify-end gap-2 items-center">
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
            <!-- <hr class="border-2 w-full mt-2 border-var(--dividerColor)" /> -->
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
              <p class="text-justify text-var(--policyTextColor)">
                {policy.name.replace(/_/g, " ")}
              </p>
            </div>
          {/each}
        {/each}
      </div>
    {/if}
  </div>

  {#if isLoadingToRole}
    <div class="w-full h-auto flex justify-center items-center gap-3">
      <Spinner color="var(--spinnerColor)" />
    </div>
  {:else if selectedRolePolicies.policies}
    <div class="flex justify-end my-4 mx-4">
      <CustomButton
        width="30%"
        height="3rem"
        icon={IconRefresh}
        label="Update"
        on:click={() => updateRole(roleOptions)}
      />
    </div>
  {/if}
</Modal>

<Drawer
  style="background-color: var(--mainBackgroundColor); color: var(--titleColor);"
  transitionType="fly"
  placement="right"
  {transitionParams}
  bind:hidden={drawerCondition}
  class="w-1/3  "
>
  <CloseButton
    style="background-color: var(--mainBackgroundColor); color: var(--titleColor);"
    on:click={() => (drawerCondition = true)}
    class="mb-4 "
  />
  <form action="#" class="mb-6">
    <div class="w-full flex justify-center items-center gap-2">
      <div class="mb-6 w-full">
        <Label style="color:var(--textColor)" for="title" class="block mb-2"
          >{"Title"}</Label
        >
        <Input
          style="background-color: var(--backgroundButtonColor); color: var(--textColor);"
          id="title"
          name="title"
          required
          placeholder="Role Title"
          bind:value={roleOptions.name}
          class="rounded"
        />
      </div>
      {#if roleOptions.id}
        <div
          class="w-24 bg-red-700 text-white h-10 flex justify-center items-center p-4 rounded"
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
      <Label style="color:var(--textColor)" for="description" class="mb-2"
        >{"policies"}</Label
      >
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
  {#if isLoadingToRole}
    <div class="w-full flex flex-wrap items-center gap-2">
      <Button class="w-full" disabled>
        <Spinner class="me-3" size="4" color="white" />
        Loading ...
      </Button>
    </div>
  {:else}
    <CustomButton
      width="100%"
      height="3rem"
      icon={IconPlus}
      label="submit"
      on:click={() => createOrUpdate(roleOptions)}
    />
  {/if}
  <div
    style="background-color: var(--backgroundButtonColor); color: var(--titleColor);"
    class="w-full h-[40rem] mt-4 rounded flex justify-start items-center flex-col px-2"
  >
    <p
      style="color: var(--titleColor);"
      class="text-center w-full h-auto mt-4 mb-8"
    >
      Roles List
    </p>
    <div class="w-full h-[40rem] overflow-y-auto">
      {#if $roleStore}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        {#each $roleStore.data as role}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="w-full h-12 text-black rounded-lg flex justify-between items-center px-4 mt-2 overflow-y-auto"
          >
            <p style="color: var(--textColor);" class="">{role.name}</p>

            <div
              class=" w-auto h-8 rounded-lg flex justify-center items-center gap-2"
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
                class="rounded-lg flex justify-center items-center cursor-pointer"
              >
                <IconEdit stroke={2} class="text-green-600" />
              </div>
              <div
                on:click={() => {
                  deleteModal = true;
                  roleData = role;
                }}
                class="rounded-lg flex justify-center items-center cursor-pointer"
              >
                <IconTrash stroke={2} class="text-red-600" />
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</Drawer>

<Modal
  style="background-color: var(--mainBackgroundColor); color: var(--textColor);"
  title="Confirm Deletion"
  bind:open={deleteModal}
  class="max-w-sm mx-auto"
  classHeader="modal-header"
  classFooter="modal-footer"
>
  <p>{"are you sure you want to delete this role ?"}</p>
  <svelte:fragment slot="footer">
    <Button
      on:click={() => {
        deleteRole(roleData.id);
      }}
      class="border bg-red-700 hover:bg-red-600">Delete</Button
    >
    <Button
      on:click={() => {
        deleteModal = false;
        roleData = new RoleDto();
      }}
      class="border text-black bg-gray-100 hover:bg-white">Cancel</Button
    >
  </svelte:fragment>
</Modal>

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

  :global(.modal-header) {
    background-color: var(--mainBackgroundColor) !important;
    color: var(--textColor) !important;
  }
  :global(.modal-footer) {
    background-color: var(--mainBackgroundColor) !important;
    color: var(--textColor) !important;
  }
</style>
