<script lang="ts">
  import {
    Avatar,
    Dropdown,
    DropdownItem,
    DropdownHeader,
    DropdownDivider,
  } from "flowbite-svelte";
  import profile from "../images/profile.jpg";
  import { onMount } from "svelte";
  // @ts-ignore
  import IconSun from "@tabler/icons-svelte/IconSun.svelte";
  // @ts-ignore
  import IconMoon from "@tabler/icons-svelte/IconMoon.svelte";
  // @ts-ignore
  import IconMenu2 from "@tabler/icons-svelte/IconMenu2.svelte";

  export let sidebarOpen: boolean;
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  //////////toggle mode////////
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
</script>

<div
  style="background-color: var(--background-color-nav);color:var(--text-color-nav)"
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
      <Avatar id="avatar-menu" src={profile} />
    </div>
  </div>
</div>
<Dropdown placement="bottom" triggeredBy="#avatar-menu">
  <DropdownHeader>
    <span class="block text-sm">Bonnie Green</span>
    <span class="block truncate text-sm font-medium">name@flowbite.com</span>
  </DropdownHeader>
  <DropdownItem>Dashboard</DropdownItem>
  <DropdownItem>Settings</DropdownItem>
  <DropdownDivider />
  <DropdownItem>Sign out</DropdownItem>
</Dropdown>
