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
  import { onMount } from "svelte";

  export let items: any = [];
  export let editData: any;
  export let handleDelete: (itemId: number) => void;
  export let tableHeaders;
  export let pageName = "";

  // Function to get the translation based on priority
  function getTranslation(item) {
    console.log("Getting translation for item", item);
    let translation = item.translation.find(
      (t) => t.language === LanguageEnum.EN && t.title
    );
    if (!translation) {
      console.log("EN translation not found, checking CKB");
      translation = item.translation.find(
        (t) => t.language === LanguageEnum.CKB && t.title
      );
    }
    if (!translation) {
      console.log("CKB translation not found, checking AR");
      translation = item.translation.find(
        (t) => t.language === LanguageEnum.AR && t.title
      );
    }
    console.log("Translation found:", translation);
    return translation;
  }

  onMount(() => {
    console.log(items);
  });
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
        {#await Promise.resolve(getTranslation(item)) then translation}
          <TableBodyRow
            style="background-color: var(--tableBackgroundColor); color:var(--tableColor)"
          >
            <TableBodyCell class="!p-4"></TableBodyCell>
            <TableBodyCell>{item.id}</TableBodyCell>
            <TableBodyCell class="font-semibold text-gray-700">
              {formatDateTime(item.created_at.toString())}
            </TableBodyCell>
            {#if translation.title}
              <TableBodyCell>
                <span>
                  {translation.title.slice(0, 40)}{translation.title.length > 40
                    ? "..."
                    : ""}
                </span>
              </TableBodyCell>
            {/if}
            <TableBodyCell>
              <span>{translation.language}</span>
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
        {/await}
      {/if}
    {/each}
  </TableBody>
</Table>
