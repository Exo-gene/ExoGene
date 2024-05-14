<script lang="ts">
  import { onMount } from "svelte";
  import "../styles.css";
  import "../../app.css";
  import Navbar from "$lib/components/Navbar.svelte";
  import Sidebar from "$lib/components/DrawerComponent.svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";

  let sidebarOpen: boolean = true;
  let isLoading: boolean = true;

  onMount(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
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
