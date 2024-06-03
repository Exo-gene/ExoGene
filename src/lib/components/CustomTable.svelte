<script lang="ts">
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import { LanguageEnum } from "../../models/languageEnum";
  import { formatDateTime } from "$lib/utils/formatDateTime";
  import IconTrash from "@tabler/icons-svelte/IconTrash.svelte";
  import IconEdit from "@tabler/icons-svelte/IconEdit.svelte";
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";
  import { authStore } from "../../stores/Auth.Store";

  export let items: any = [];
  export let editData: any;
  export let handleDelete: (itemId: number) => void;
  export let tableHeaders;
  export let pageName = "";
</script>

<Table>
  <TableHead
    style="background-color: var(--tableHeaderBackgroundColor); color:var(--tableHeaderColor)"
  >
    <TableHeadCell class="!p-4"></TableHeadCell>
    {#each tableHeaders as header}
      <TableHeadCell>{header}</TableHeadCell>
    {/each}
  </TableHead>
  <TableBody tableBodyClass="divide-y">
    {#each items as item}
      <TableBodyRow
        style="background-color: var(--tableBackgroundColor); color:var(--tableColor)"
      >
        <TableBodyCell class="!p-4"></TableBodyCell>
        <TableBodyCell>{item.id}</TableBodyCell>
        <TableBodyCell class="font-semibold text-gray-700">
          {formatDateTime(item.created_at.toString())}
        </TableBodyCell>
        {#each item.translation as translation}
          {#if translation.language === LanguageEnum.EN}
            {#if "title" in translation}
              <TableBodyCell>
                <span
                  >{translation.title.slice(0, 40)}{translation.title.length >
                  40
                    ? "..."
                    : ""}</span
                >
              </TableBodyCell>
            {/if}
            <TableBodyCell>
              <span>{translation.language}</span>
            </TableBodyCell>
          {/if}
        {/each}

        <TableBodyCell class="flex space-x-3">
          {#if checkUserPolicies([Policies[`UPDATE_${pageName.toUpperCase()}`]], $authStore)}
            <button
              class="font-medium text-green-600 hover:underline dark:text-green-600"
              on:click={() => editData(item.id)}
            >
              <IconEdit stroke={2} class="text-green-700" />
            </button>
          {/if}
          {#if checkUserPolicies([Policies[`DELETE_${pageName.toUpperCase()}`]], $authStore)}
            <button on:click={() => handleDelete(item.id)}
              ><IconTrash stroke={2} class="text-red-700" /></button
            >
          {/if}
        </TableBodyCell>
      </TableBodyRow>
    {/each}
  </TableBody>
</Table>
