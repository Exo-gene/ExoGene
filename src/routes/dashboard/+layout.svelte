<script>
  import "../styles.css";
  import "../../app.css";
  import Navbar from "$lib/components/Navbar.svelte";
  import DrawerComponent from "$lib/components/DrawerComponent.svelte";
  import { theme } from "../../stores/themStore";
  import { onDestroy } from "svelte";

  let dataTheme = "light";
  let isDrawerExpanded = true; // State to manage drawer width

  // Subscribe to theme changes
  const unsubscribe = theme.subscribe((value) => {
    dataTheme = value ? "dark" : "light";
  });
  onDestroy(unsubscribe);

  function toggleDrawer() {
    isDrawerExpanded = !isDrawerExpanded;
  }
</script>

<div class="app" data-theme={dataTheme}>
  <Navbar />

  <main
    class="h-screen"
    style="background-color: var(--background-color); color: var(--text-color)"
  >
    <slot />
  </main>
</div>

<style>
</style>
