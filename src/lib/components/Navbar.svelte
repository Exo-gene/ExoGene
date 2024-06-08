<script lang="ts">
  import {
    Avatar,
    Dropdown,
    DropdownItem,
    DropdownHeader, 
  } from "flowbite-svelte"; 
  import { onMount } from "svelte";
  import IconSun from "@tabler/icons-svelte/IconSun.svelte";
  import IconMoon from "@tabler/icons-svelte/IconMoon.svelte";
  import IconMenu2 from "@tabler/icons-svelte/IconMenu2.svelte";
  import { authStore } from "../../stores/Auth.Store";
  import { goto } from "$app/navigation";
  import logo_dark from "../images/logo.png";
  import logo_light from "../images/logo_light.png";
  import logo_sidebar from "../images/tiwar.png";
  import { page } from "$app/stores";
 
   let currentLogo = logo_dark;
  export let sidebarOpen: boolean;

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  // Toggle theme
  let theme = "light";
  onMount(async () => {
    theme = localStorage.getItem("theme") || "light";
    updateTheme();
  });

  function toggleTheme() {
    theme = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", theme);
    updateTheme();
  }

  function updateTheme() {
    document.documentElement.setAttribute("data-theme", theme);
  }

  // Logout function
  async function handleLogout() {
    await authStore.logout();
    goto('/')
  }
    // view user profile
  async function userProfile(uId : string) {
    goto(`/dashboard/employees/edit/${uId}`)
  }


   // Reactive statement to update the logo based on current theme
  $: currentLogo = theme === "light" ? logo_light : logo_dark;

  // Function to detect active URL
  $: activeUrl = $page.url.pathname;
  function updateActiveUrl(url: string) {
    activeUrl = url;
  }

    // Function to detect current theme based on document attribute
  function getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  // Listen for changes to the theme attribute
  onMount(() => {
    const observer = new MutationObserver(() => {
      theme = getCurrentTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  });
</script>

<div style="background-color: var(--background-color-nav); color: var(--text-color-nav);">
  <div class="flex items-center justify-between px-4 py-2">
    <div class="flex items-center justify-start">
      <div class="mb-2 mr-16 py-2">
    <img
      src={sidebarOpen ? currentLogo : logo_sidebar}
      alt="Logo"
      class="h-8 w-auto"
    />
  </div>
      <button class="p-2" on:click={toggleSidebar}>
        <IconMenu2 stroke="2" class="text-gray-700" />
      </button>
    </div>
    <div class="flex items-center cursor-pointer">
      <button on:click={toggleTheme} class="mr-4">
        {#if theme === "light"}
          <IconMoon stroke={2} />
        {:else}
          <IconSun stroke={2} />
        {/if}
      </button>
      <Avatar id="avatar-menu" src={$authStore?.image} />
    </div>
  </div>
</div>
<Dropdown placement="bottom" triggeredBy="#avatar-menu">
  <DropdownHeader>
    <span class="block text-sm">{$authStore?.name}</span>
    <span class="block truncate text-sm font-medium">{$authStore?.email}</span>
  </DropdownHeader>
  <DropdownItem on:click={()=>userProfile($authStore?.id ?? '')}>Profile</DropdownItem>
  <!-- <DropdownItem>Settings</DropdownItem> -->
  <!-- <DropdownDivider /> -->
  <DropdownItem on:click={handleLogout}>Sign out</DropdownItem>  
</Dropdown>


<style>
  .flex {
    display: flex;
  }
  .items-center {
    align-items: center;
  }
  .justify-between {
    justify-content: space-between;
  }
  .justify-start {
    justify-content: flex-start;
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .p-2 {
    padding: 0.5rem;
  }
  .mr-4 {
    margin-right: 1rem;
  }
  .text-gray-700 {
    color: #4a5568;
  }
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .py-2 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
</style>
