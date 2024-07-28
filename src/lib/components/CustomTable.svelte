<script lang="ts">
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import { formatDateTime } from "$lib/utils/formatDateTime";
  import { IconEdit, IconTrash } from "@tabler/icons-svelte";
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";
  import { authStore } from "../../stores/Auth.Store";

  export let pageName: string;
  export let items: any = [];
  export let editData: any;
  export let handleDelete: (itemId: number) => void;
  export let tableHeaders;

 
</script>

<div class="border">


<Table hoverable={true}>
  <TableHead style="background-color: var(--tableHeaderBackgroundColor); color:var(--tableHeaderColor)">
    <TableHeadCell class="!p-4 "></TableHeadCell>
    {#each tableHeaders as header}
      <TableHeadCell>{header}</TableHeadCell>
    {/each}
  </TableHead>
  <TableBody tableBodyClass="divide-y">
    {#each items as item}
      <TableBodyRow style="background-color: var(--mainBackgroundColor); color:var(--textColor)">
        <TableBodyCell class="!p-4"></TableBodyCell>
        <TableBodyCell>{item.id}</TableBodyCell>
        <TableBodyCell class="font-semibold">
          {formatDateTime(item.created_at.toString())}
        </TableBodyCell>
        <TableBodyCell>{item.lab_name}</TableBodyCell>
        <TableBodyCell>{item.address}</TableBodyCell>
        <TableBodyCell class="flex space-x-3">
          {#if checkUserPolicies([Policies[`UPDATE_${pageName.toUpperCase()}`]], $authStore)}
            <button class="font-medium text-green-600 hover:underline dark:text-green-600" on:click={() => editData(item.id)}>
              <IconEdit stroke={2} class="text-green-700" />
            </button>
          {/if}
          {#if checkUserPolicies([Policies[`DELETE_${pageName.toUpperCase()}`]], $authStore)}
            <button on:click={() => handleDelete(item.id)}>
              <IconTrash stroke={2} class="text-red-700" />
            </button>
          {/if}
        </TableBodyCell>
      </TableBodyRow>
    {/each}
  </TableBody>
</Table>
 </div>

<style>
  .table-cell-bottom-border {
    border-bottom: 1px solid var(--textColor);
  }
</style>