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
  // @ts-ignore
  import IconTrash from "@tabler/icons-svelte/IconTrash.svelte";
  // @ts-ignore
  import IconEdit from "@tabler/icons-svelte/IconEdit.svelte";
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";
  import { authStore } from "../../stores/Auth.Store";

  export let items: any = [];
  export let editData: any;
  export let handleDelete: (itemId: number) => void;
  export let tableHeaders;
  export let pageName = "";

  // Function to get the translation based on priority
  function getTranslation(item:any) {
    let translation = item.translation.find(t => t.language === LanguageEnum.EN && t.title !== null);
    if (!translation) {
      translation = item.translation.find(t => t.language === LanguageEnum.CKB && t.title !== null);
    }
    if (!translation) {
      translation = item.translation.find(t => t.language === LanguageEnum.AR && t.title !== null);
    }
    return translation;
  }
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
      {#if getTranslation(item)}
        <TableBodyRow
          style="background-color: var(--tableBackgroundColor); color:var(--tableColor)"
        >
          <TableBodyCell class="!p-4"></TableBodyCell>
          <TableBodyCell>{item.id}</TableBodyCell>
          <TableBodyCell class="font-semibold text-gray-700">
            {formatDateTime(item.created_at.toString())}
          </TableBodyCell>
          <TableBodyCell>
            <span>
              {getTranslation(item).title ? getTranslation(item).title.slice(0, 40) : ''}{getTranslation(item).title && getTranslation(item).title.length > 40 ? "..." : ""}
            </span>
          </TableBodyCell>
          <TableBodyCell>
            <span>{getTranslation(item).language}</span>
          </TableBodyCell>
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
      {/if}
    {/each}
  </TableBody>
</Table>
