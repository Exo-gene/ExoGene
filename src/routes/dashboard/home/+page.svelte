<script lang="ts">
  import { goto } from "$app/navigation";
  import { IconMoon, IconSun } from "@tabler/icons-svelte";
  import {
    IconEmergencyBed,
    IconMicroscope,
    IconUsersPlus,
    IconHierarchy2,
    IconAlignBoxBottomLeft,
    IconBrandCoinbase,
    IconNurse,
    IconFlask,
    IconBasket,
    IconCalculator,
    IconSticker2,
    IconPasswordUser,
    IconChartInfographic,
    IconReport,
    IconPalette,
  } from "@tabler/icons-svelte";
  import CustomButton from "$lib/components/CustomButton.svelte";
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils";
  import { authStore } from "../../../stores/Auth.Store";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";
  import { onMount } from "svelte";
  import { themeStore } from "../../../stores/themeStore";
  import { get } from "svelte/store";

  function redirectToPage(page: string) {
    goto(`/dashboard/${page}`);
  }

  // Toggle theme
  let theme = "light";
  let themeData = { light: {}, dark: {} };

  onMount(async () => {
    theme = localStorage.getItem("theme") || "light";
    await themeStore.fetchThemeData();
    themeStore.subscribe((data) => {
      themeData = data;
      updateTheme();
    });
  });

  function toggleTheme() {
    theme = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", theme);
    updateTheme();
  }

  // custom theme
  function updateTheme() {
    const currentTheme = themeData[theme];
    document.documentElement.setAttribute("data-theme", theme);
    if (currentTheme) {
      document.documentElement.style.setProperty(
        "--mainBackgroundColor",
        currentTheme.mainBackgroundColor || "#E0E0E0"
      );
      document.documentElement.style.setProperty(
        "--textColor",
        currentTheme.textColor || "#181818"
      );
      document.documentElement.style.setProperty(
        "--buttonBackgroundColor",
        currentTheme.backgroundButtonColor || "#1E90FF"
      );
    }
  }
</script>

<div class="max-w-screen-xl mx-auto flex items-center justify-center h-2/3">
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconEmergencyBed}
        label="Patient"
        on:click={() => redirectToPage("patient")}
      />
    </div>
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconMicroscope}
        label="Test"
        on:click={() => redirectToPage("test")}
      />
    </div>

    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconHierarchy2}
        label="Status"
        on:click={() => redirectToPage("status")}
      />
    </div>
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconAlignBoxBottomLeft}
        label="Sample Type"
        on:click={() => redirectToPage("sample-type")}
      />
    </div>
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconBrandCoinbase}
        label="Company"
        on:click={() => redirectToPage("company")}
      />
    </div>
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconNurse}
        label="Doctor"
        on:click={() => redirectToPage("doctor")}
      />
    </div>
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconFlask}
        label="Lab"
        on:click={() => redirectToPage("lab")}
      />
    </div>
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconBasket}
        label="Store"
        on:click={() => redirectToPage("store")}
      />
    </div>
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconCalculator}
        label="Accountant"
        on:click={() => redirectToPage("accountant")}
      />
    </div>
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconSticker2}
        label="Sticker"
        on:click={() => redirectToPage("sticker")}
      />
    </div>
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconPasswordUser}
        label="Role"
        on:click={() => redirectToPage("role")}
      />
    </div>
    {#if checkUserPolicies([Policies.READ_USER], $authStore)}
      <div class="flex justify-center">
        <CustomButton
          width="100%"
          height="4rem"
          icon={IconUsersPlus}
          label="Users"
          on:click={() => redirectToPage("users")}
        />
      </div>
    {/if}
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconChartInfographic}
        label="Statistic"
        on:click={() => redirectToPage("statistic")}
      />
    </div>
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconReport}
        label="Report"
        on:click={() => redirectToPage("report")}
      />
    </div>
    {#if checkUserPolicies([Policies.READ_CUSTOMTHEME], $authStore)}
      <div class="flex justify-center">
        <CustomButton
          width="100%"
          height="4rem"
          icon={IconPalette}
          label="System Theme"
          on:click={() => redirectToPage("system-theme")}
        />
      </div>
    {/if}
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconMoon}
        label="Toggle"
        on:click={toggleTheme}
      />
    </div>
  </div>
</div>
