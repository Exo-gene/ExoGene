<script lang="ts">
  import { onMount } from "svelte";
  import "../styles.css";
  import "../../app.css";
  import Navbar from "$lib/components/Navbar.svelte";
  import Sidebar from "$lib/components/DrawerComponent.svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import { UsersRepository } from "$lib/Repositories/Implementation/Users.Repository";

  let sidebarOpen: boolean = true;
  let isLoading: boolean = true;
  const repository = new UsersRepository();

  onMount(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // const response = await fetch("/api/user/create", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     policy: "create",
    //   }),
    // });
    const data = await repository.getUsers();
    console.log(data);
    isLoading = false;
  });
</script>

{#if isLoading}
  <LoadingIndicator />
{:else}
  <div class="flex h-screen">
    <Sidebar {sidebarOpen} />
    <div
      class="flex-1 flex flex-col"
      style="background-color: var(--background-color); color: var(--text-color)"
    >
      <Navbar bind:sidebarOpen />
      <main class="p-4">
        <slot></slot>
      </main>
    </div>
  </div>
{/if}
