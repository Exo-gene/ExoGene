<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { items } from "./navbarItems";
  import { authStore } from "../../stores/Auth.Store";
  import { checkUserPolicies } from "../utils/checkUserPolicies.Utils";
  import { onMount } from "svelte";

  export let sidebarOpen: boolean;
  let navItems = items;
  let activeUrl: string; 
 
  // Function to detect current theme based on document attribute
  function getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  // Reactive statement to update the logo based on current theme
  $: theme = getCurrentTheme();
 
  // Function to detect active URL
  $: activeUrl = $page.url.pathname;
  function updateActiveUrl(url: string) {
    activeUrl = url;
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
  class="{sidebarOpen
    ? 'w-64'
    : 'w-20'} transition-all ease-in-out duration-300 min-h-full"
  style="background-color: var(--background-color-nav); color: var(--text-color-nav)"
>

  <nav
    class="flex flex-col gap-1 min-w-[240px] p-2 font-sans text-base font-normal text-gray-700"
  >
    {#each navItems as item}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      {#if checkUserPolicies(item.policies, $authStore)}
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
