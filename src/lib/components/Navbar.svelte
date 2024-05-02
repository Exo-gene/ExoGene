<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import items from "../jsonFiles/navbarItems.json";
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
  import logo_dark from "../images/logo.png";
  import logo_light from "../images/logo_light.png";
  import profile from "../images/profile.jpg";
  import { theme } from "../../stores/themStore";
  import { onDestroy } from "svelte";

  let navItems = items;
  let activeUrl: string;
  let currentLogo = logo_dark;
  ////////detect active URL/////////
  $: activeUrl = $page.url.pathname;
  function updateActiveUrl(url: string) {
    activeUrl = url;
  }

  //////toggle button////////
  let isActive = false;
  const unsubscribe = theme.subscribe((value) => {
    isActive = value;
    currentLogo = isActive ? logo_dark : logo_light;
  });
  function toggleTheme() {
    theme.update((current) => !current);
  }
  // Cleanup the subscription on component destruction
  onDestroy(unsubscribe);
</script>

<Navbar
  style="background-color: var(--background-color-nav);color: var(--text-color-nav)"
>
  <NavBrand href="/dashboard/home">
    <img src={currentLogo} class="me-3 h-6 sm:h-9" alt="logo" />
  </NavBrand>

  <div class="flex items-center md:order-2 cursor-pointer">
    <button
      class="toggle-button mx-3"
      on:click={toggleTheme}
      data-active={isActive}
    >
      <div class="toggle-knob"></div>
    </button>
    <Avatar id="avatar-menu" src={profile} />
    <NavHamburger class1="w-full md:flex md:w-auto md:order-1" />
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

  <NavUl>
    {#each navItems as item}
      <NavLi
        class="cursor-pointer"
        on:click={() => {
          updateActiveUrl(item.url);
          goto(item.url);
        }}
        style={`color: ${activeUrl === item.url ? "var(--activeText-color-nav)" : "var(--text-color-nav)"}; 
          
          `}
      >
        {item.label}
      </NavLi>
    {/each}
  </NavUl>
</Navbar>

<style>
  .toggle-button {
    background-color: var(--toggleButtonColor);
    border: none;
    cursor: pointer;
    height: 24px;
    width: 48px;
    border-radius: 24px;
    position: relative;
    transition: background-color 0.3s;
  }

  .toggle-button[data-active="true"] .toggle-knob {
    transform: translateX(24px);
  }

  .toggle-knob {
    height: 20px;
    width: 20px;
    background-color: var(--text-color);
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.3s ease-in-out;
  }
</style>
