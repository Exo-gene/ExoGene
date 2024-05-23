<script lang="ts">
  import logo_dark from "../images/logo.png";
  import logo_light from "../images/logo_light.png";
  import logo_sidebar from "../images/logoSidebar.png";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { items } from "./navbarItems";
  import { onMount } from "svelte";
  import { authStore } from "../../stores/Auth.Store";
  import { checkUserPolicies } from "../utils/checkUserPolicies.Utils";

  export let sidebarOpen: boolean;
  let navItems = items;
  let activeUrl: string;
  let currentLogo = logo_dark; // Default logo

  // Reactive statement to update the logo based on sidebar state
  let theme: any;
  onMount(() => {
    theme = localStorage.getItem("theme") || "light";
    console.log("IN Navbar", $authStore);
  });

  $: currentLogo = theme === "light" ? logo_light : logo_dark;
  ////////detect active URL/////////
  $: activeUrl = $page.url.pathname;
  function updateActiveUrl(url: string) {
    activeUrl = url;
  }

  // function checkUserPolicy(premissions: number[]) {
  //   // Check if $authStore and roles are defined
  //   if ($authStore?.roles) {
  //     for (const role of $authStore.roles) {
  //       for (const policy of role.policies) {
  //         if (premissions.includes(Number(policy.id))) {
  //           return true;
  //         }
  //       }
  //     }
  //   }
  //   return false;
  // }
</script>

<div
  class="{sidebarOpen
    ? 'w-64'
    : 'w-20'} transition-all ease-in-out duration-300 h-full"
  style="background-color: var(--background-color-nav);color: var(--text-color-nav)"
>
  <div class="mb-2 p-4 border">
    <img
      src={sidebarOpen ? currentLogo : logo_sidebar}
      alt="Logo"
      class="h-8 w-auto"
    />
  </div>
  <nav
    class="flex flex-col gap-1 min-w-[240px] p-2 font-sans text-base font-normal text-gray-700"
  >
    {#each navItems as item}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      {#if checkUserPolicies(item.policies,$authStore)}
        <div
          on:click={() => {
            updateActiveUrl(item.url);
            goto(item.url);
          }}
          style={`color: ${activeUrl === item.url ? "var(--activeText-color-nav)" : "var(--text-color-nav)"};`}
          class="cursor-pointer flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all outline-none"
        >
          <div class="grid place-items-center mr-4">
            <span>{@html item.icon}</span>
          </div>
          {#if sidebarOpen}
            <span class="ml-2">{item.label}</span>
          {/if}
        </div>
      {/if}
    {/each}
  </nav>
</div>
