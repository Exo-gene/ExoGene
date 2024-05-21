<script>
	import { userStore } from './../../../stores/User.Store';
    import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
  import { onMount } from 'svelte';

    onMount(async () => {
        console.log('Hello from the employees page');
        await userStore.getAll();
        console.log($userStore);
    });
  </script>
  
  <Table shadow>
    <TableHead>
      <TableHeadCell>Image</TableHeadCell>
      <TableHeadCell>Name</TableHeadCell>
      <TableHeadCell>Email</TableHeadCell>
    </TableHead>
    <TableBody tableBodyClass="divide-y">
        {#each $userStore.data as user}
      <TableBodyRow>
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <TableBodyCell><img src="{user.image ?? "/images/defualt.png"}" alt="User Image" class="object-cover rounded-lg w-12 h-12"></TableBodyCell>
        <TableBodyCell>{user.name}</TableBodyCell>
        <TableBodyCell>{user.email}</TableBodyCell>
      </TableBodyRow>
      {/each}
    </TableBody>
  </Table>