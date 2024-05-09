<script lang="ts">
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  // import EditButton from "./EditButton.svelte";
  import PaginationControls from "./PaginationControls.svelte";

  export let tableHeaders: string[] = [];
  export let items: any[] = [];
  export let currentPage: number;
  export let totalPages: number;
  export let previousPage: () => void;
  export let nextPage: () => void;
  export let onDelete: (itemId: number) => void;

  function handleDelete(itemId: number) {
    onDelete(itemId);
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
      <TableBody>
        {#each items as item}
          <TableBodyRow
            style="background-color: var(--tableBackgroundColor); color:var(--tableColor)"
          >
            <TableBodyCell class="!p-4"></TableBodyCell>
            {#each Object.values(item) as value}
              <TableBodyCell>{value}</TableBodyCell>
            {/each}
            <TableBodyCell class="flex space-x-3">
              <!-- action buttons -->
              <!-- <EditButton categoryId={item.id} pageLink="categories" /> -->
              <button on:click={() => handleDelete(item.id)}>Delete</button>
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
