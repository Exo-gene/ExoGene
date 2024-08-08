<script lang="ts">
  import { goto } from "$app/navigation";
  import { IconMoneybag, IconMoon, IconSun } from "@tabler/icons-svelte";
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
  import Role from "$lib/components/Modals/Role.Modal.Component.svelte";
  import { supabase } from "$lib/supabaseClient";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";

 

  // Toggle theme
  let isLoading: boolean = true;
  let theme = "light";
  let themeData: any = { light: {}, dark: {} };
   let currency: string | undefined;

  onMount(async () => {
    await CheckAuth();
    await loadThemeData();
    await getCurrency();
    isLoading = false;
  });

  function redirectToPage(page: string) {
    goto(`/dashboard/${page}`);
  }
  async function CheckAuth() {
    await authStore.getAuth();
    if (!$authStore) {
      return goto("/");
    }
  }

  async function loadThemeData() {
    theme = localStorage.getItem("theme") || "light";
    await themeStore.fetchThemeData();
    themeStore.subscribe((data) => {
      themeData = data;
      applyTheme(data[theme]);
    });
  }

  function applyTheme(themeVariables: any) {
    for (const [key, value] of Object.entries(themeVariables)) {
      document.documentElement.style.setProperty(`--${key}`, value);
    }
  }

  function toggleTheme() {
    theme = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", theme);
    applyTheme(themeData[theme]);
  }

  /////////////////////////////
  let isLoadingToRole: boolean = false;
  let roleModal: boolean = false;


  ///////get currency//////////
 async function getCurrency() {
    const { data, error } = await supabase
      .from('currency')
      .select('*')
      .limit(1)
      .single();
    if (data) { 
      currency = data.money_dinar;
    } else {
      currency = undefined;
    }
    if (error) {
      console.log(error);
      currency = undefined;
    }
  }
</script>
{#if isLoading}
<LoadingIndicator/>
{:else} 

  <!-- showing currency of today  -->
<div class="my-2 w-full rounded max-w-screen-xl mx-auto flex justify-end ">
<div class="w-1/5 p-4 rounded"  style="background-color: var(--backButtonBackgroundColor);color:var(--textColor)">
   100$ , <span class="font-bold mx-1"
 >{currency}</span> IQD
</div>
</div>

<Role bind:isLoadingToRole bind:roleModal />

<div class="max-w-screen-xl mx-auto flex items-center justify-center h-2/3">

<!-- showing buttons of dashboard  -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">

   {#if checkUserPolicies([Policies.READ_PATIENTREGISTRATION], $authStore)}
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconEmergencyBed}
        label="Patient Registration"
        on:click={() => redirectToPage("patientRegistration")}
      />
    </div>
    {/if}
      {#if checkUserPolicies([Policies.READ_ACCOUNTANT], $authStore)}
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconCalculator}
        label="Accountant"
        on:click={() => redirectToPage("accountant")}
      />
    </div>
    {/if}
    {#if checkUserPolicies([Policies.READ_TEST], $authStore)}
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconMicroscope}
        label="Test"
        on:click={() => redirectToPage("test")}
      />
    </div>
    {/if}
    {#if checkUserPolicies([Policies.READ_STATUS], $authStore)}
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconHierarchy2}
        label="Status"
        on:click={() => redirectToPage("status")}
      />
    </div>
    {/if}
     {#if checkUserPolicies([Policies.READ_SAMPLETYPE], $authStore)}
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconAlignBoxBottomLeft}
        label="Sample Type"
        on:click={() => redirectToPage("sampleType")}
      />
    </div>
    {/if}
     {#if checkUserPolicies([Policies.READ_COMPANY], $authStore)}
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconBrandCoinbase}
        label="Company"
        on:click={() => redirectToPage("company")}
      />
    </div>
    {/if}
    {#if checkUserPolicies([Policies.READ_DOCTOR], $authStore)}
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconNurse}
        label="Doctor"
        on:click={() => redirectToPage("doctor")}
      />
    </div>
    {/if}
    {#if checkUserPolicies([Policies.READ_LAB], $authStore)}
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconFlask}
        label="Lab"
        on:click={() => redirectToPage("lab")}
      />
    </div>
    {/if}
    {#if checkUserPolicies([Policies.READ_STORE], $authStore)}
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconBasket}
        label="Store"
        on:click={() => redirectToPage("store")}
      />
    </div>
    {/if}
     {#if checkUserPolicies([Policies.READ_ROLE], $authStore)}
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconPasswordUser}
        label="Role"
        on:click={() => (roleModal = true)}
      />
    </div>
    {/if}
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
    {#if checkUserPolicies([Policies.CREATE_CURRENCY], $authStore)}
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconMoneybag}
        label="Currency"
        on:click={() => redirectToPage("currency")}
      />
    </div>
    {/if}
    <!-- {#if checkUserPolicies([Policies.READ_REPORT], $authStore)} -->
    <div class="flex justify-center">
      <CustomButton
        width="100%"
        height="4rem"
        icon={IconReport}
        label="Report"
        on:click={() => redirectToPage("report")}
      />
    </div>
    <!-- {/if} -->
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
{/if}
