<!-- <script lang="ts">
  import {
    Avatar,
    Dropdown,
    DropdownItem,
    DropdownHeader,
  } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { authStore } from "../../stores/Auth.Store";
  import { goto } from "$app/navigation";
  import { IconMoon, IconSun } from "@tabler/icons-svelte";
  import { themeStore } from "../../stores/customThemeStore";
  import { get } from "svelte/store";

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
    goto("/");
  }

  // View user profile
  async function userProfile(uId: string) {
    goto(`/dashboard/employees/edit/${uId}`);
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

<div
  class="flex justify-end"
  style="background-color: var(--background-color-nav); color: var(--text-color-nav);"
>
  <div class="flex items-center justify-between px-4 py-2">
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
  <DropdownItem on:click={() => userProfile($authStore?.id ?? "")}
    >Profile</DropdownItem
  >
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
  .cursor-pointer {
    cursor: pointer;
  }
  .p-2 {
    padding: 0.5rem;
  }
  .mr-4 {
    margin-right: 1rem;
  }
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .py-2 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
</style> -->
