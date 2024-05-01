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
  import EditButton from "./EditButton.svelte";
  import PaginationControls from "./PaginationControls.svelte";
  import { createEventDispatcher } from "svelte";

  export let tableHeaders: any = [];
  export let categories: any = [];
  export let currentPage = 1;
  export let totalPages = 1;
  export let previousPage: () => void;
  export let nextPage: () => void;
  export let formatDateTime: (date: any) => string;

  const dispatch = createEventDispatcher();
  function handleDelete(categoryId: number) {
    dispatch("delete", categoryId);
  }

  // Re-render the component when categories or currentPage changes
  $: {
    console.log("Categories updated:", categories);
  }
</script>

<div class="mx-2">
  <div>
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
        {#each categories as category}
          <TableBodyRow
            style="background-color: var(--tableBackgroundColor); color:var(--tableColor)"
          >
            <TableBodyCell class="!p-4"></TableBodyCell>
            <TableBodyCell>{category.id}</TableBodyCell>
            <TableBodyCell class="font-semibold text-gray-700">
              {formatDateTime(category.created_at)}
            </TableBodyCell>
            {#each category.categorytranslation || [] as translation}
              {#if translation.language === LanguageEnum.EN}
                <TableBodyCell>
                  <span>{translation.title}</span>
                </TableBodyCell>
                <TableBodyCell>
                  <span>{translation.language}</span>
                </TableBodyCell>
              {/if}
            {/each}
            <TableBodyCell class="flex space-x-3">
              <EditButton categoryId={category.id} pageLink="categories" />
              <button on:click={() => handleDelete(category.id)}>Delete</button>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </div>

  <div>
    <PaginationControls {currentPage} {totalPages} {previousPage} {nextPage} />
  </div>
</div>
