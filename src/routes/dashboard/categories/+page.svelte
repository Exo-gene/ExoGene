<script lang="ts">
  import InsertButton from "../../../lib/components/InsertButton.svelte";
  import { goto } from "$app/navigation";
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Checkbox,
  } from "flowbite-svelte";

  function createCategory() {
    goto("/dashboard/categories/create");
  }

  // Example data and headers
  const tableHeaders = ["Product name", "Color", "Category", "Price", "ACTION"];

  const tableData = [
    {
      id: 1,
      name: 'Apple MacBook Pro 17"',
      color: "Silver",
      category: "Laptop",
      price: "$2999",
      actions: "/tables",
    },
    {
      id: 2,
      name: "Microsoft Surface Pro",
      color: "White",
      category: "Laptop PC",
      price: "1.0 lb.",
      actions: "/tables",
    },
    {
      id: 3,
      name: "Magic Mouse 2",
      color: "Black",
      category: "Accessories",
      price: "0.2 lb.",
      actions: "/tables",
    },
  ];
</script>

<div class="mx-2">
  <InsertButton insertData={createCategory} />
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
        {#each tableData as row}
          <TableBodyRow
            style="background-color: var(--tableBackgroundColor); color:var(--tableColor)"
          >
            <TableBodyCell class="!p-4"></TableBodyCell>
            <TableBodyCell>{row.name}</TableBodyCell>
            <TableBodyCell>{row.color}</TableBodyCell>
            <TableBodyCell>{row.category}</TableBodyCell>
            <TableBodyCell>{row.price}</TableBodyCell>
            <TableBodyCell class="flex space-x-3">
              <a
                href={row.actions}
                class="font-medium text-green-600 hover:underline dark:text-green-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="ionicon"
                  viewBox="0 0 512 512"
                  width="24"
                  height="24"
                >
                  <path
                    d="M384 224v184a40 40 0 01-40 40H104a40 40 0 01-40-40V168a40 40 0 0140-40h167.48"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="32"
                  />
                  <path
                    d="M459.94 53.25a16.06 16.06 0 00-23.22-.56L424.35 65a8 8 0 000 11.31l11.34 11.32a8 8 0 0011.34 0l12.06-12c6.1-6.09 6.67-16.01.85-22.38zM399.34 90L218.82 270.2a9 9 0 00-2.31 3.93L208.16 299a3.91 3.91 0 004.86 4.86l24.85-8.35a9 9 0 003.93-2.31L422 112.66a9 9 0 000-12.66l-9.95-10a9 9 0 00-12.71 0z"
                  />
                </svg>
              </a>

              <a
                href={row.actions}
                class="font-medium text-red-600 hover:underline dark:text-red-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="ionicon"
                  viewBox="0 0 512 512"
                  width="24"
                  height="24"
                  ><path
                    d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="32"
                  /><path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-miterlimit="10"
                    stroke-width="32"
                    d="M80 112h352"
                  /><path
                    d="M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="32"
                  /></svg
                >
              </a>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </div>
</div>
