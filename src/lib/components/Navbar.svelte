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
</script>

<div
  style="background-color: var(--background-color-nav); color: var(--text-color-nav);"
>
  <div class="flex items-center justify-between px-4 py-2">
    <div class="flex items-center justify-start">
      <button class="p-2" on:click={toggleSidebar}>
        <IconMenu2 stroke="2" class="text-gray-700" />
      </button>
    </div>
    <div class="flex items-center md:order-2 cursor-pointer">
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
  <DropdownItem on:click={userProfile($authStore.id)}>Profile</DropdownItem>
  <!-- <DropdownItem>Settings</DropdownItem> -->
  <!-- <DropdownDivider /> -->
  <DropdownItem on:click={handleLogout}>Sign out</DropdownItem>  
</Dropdown>
