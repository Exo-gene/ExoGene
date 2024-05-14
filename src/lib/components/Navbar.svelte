<script lang="ts">
  import IconMenu2 from "@tabler/icons-svelte/IconMenu2.svelte";
  import {
    Navbar,
    NavBrand,
    NavLi,
    NavUl,
    NavHamburger,
    Avatar,
    Dropdown,
    DropdownItem,
    DropdownHeader,
    DropdownDivider,
  } from "flowbite-svelte";
  import profile from "../images/profile.jpg";
  import { onMount } from "svelte";

  export let sidebarOpen: boolean;
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  //////////toggle mode////////
  let theme = "light";
  onMount(() => {
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
        {theme === "light" ? "Dark" : "Light"}
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
  <DropdownItem>Earnings</DropdownItem>
  <DropdownDivider />
  <DropdownItem>Sign out</DropdownItem>
</Dropdown>
