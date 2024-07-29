<script lang="ts">
  import { Tabs, TabItem, Label, Button } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { onMount } from "svelte";
  import Toast from "$lib/components/Toast.svelte";
  import FullPageLoadingIndicator from "$lib/components/FullPageLoadingIndicator.svelte";
  import { checkUserPolicies } from "$lib/utils/checkUserPolicies.Utils";
  import { authStore } from "../../../stores/Auth.Store";
  import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";
  import type { CustomThemeModel } from "../../../models/customThemeModel";
  import ThemeEditor from "$lib/components/ThemeEditor.svelte";
  import CustomButton from "$lib/components/CustomButton.svelte";
  import { IconRefresh } from "@tabler/icons-svelte";
  import ButtonComponent from "$lib/components/ButtonComponent.svelte";
  import { goto } from "$app/navigation";

  let isLoading = false;
  let showToast = false;
  let toastMessage = "";
  let themes: CustomThemeModel[] = [];
  let lightTheme: CustomThemeModel | null = null;
  let darkTheme: CustomThemeModel | null = null;

  // fetch data from db
  onMount(async () => {
    isLoading = true;
    let { data, error } = await supabase.from("customTheme").select("*");
    isLoading = false;
    if (data) {
      themes = data;
      lightTheme = data.find((theme) => theme.theme === "light") || null;
      darkTheme = data.find((theme) => theme.theme === "dark") || null;
    } else if (error) {
      console.error(error);
    }
  });

  async function updateThemes() {
    isLoading = true;
    let updates = [];
    if (lightTheme) {
      updates.push(
        supabase.from("customTheme").update(lightTheme).eq("id", lightTheme.id)
      );
    }
    if (darkTheme) {
      updates.push(
        supabase.from("customTheme").update(darkTheme).eq("id", darkTheme.id)
      );
    }

    try {
      await Promise.all(updates);
      toastMessage = "Themes updated successfully";
      showToast = true;
      setTimeout(() => {
        showToast = false;
      }, 2000);
    } catch (error) {
      toastMessage = "Error updating themes";
      showToast = true;
      console.error(error);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="max-w-screen-xl mx-auto flex flex-col items-center h-1/3">
  <!-- Header Section -->
  <div class="w-full flex items-center justify-between py-4">
     <ButtonComponent title="Back" dispatch={() => goto("/dashboard/home")} />
    <h1
      class="font-bold text-center flex-grow"
      style="color: var(--titleColor);"
    >
      Update Theme
    </h1>
  </div>

  <!-- Main Content -->
  <div class="w-full flex items-center justify-center flex-grow">
    {#if isLoading}
      <FullPageLoadingIndicator />
    {:else}
      <div class="w-full flex justify-center">
        <div class="max-w-screen-md w-full">
          <Tabs
            tabStyle="underline"
            defaultClass="bg-[#D0D0D0] flex"
            activeClass="active"
          >
            {#if lightTheme}
              <TabItem title="Light Theme" open={true}>
                <div class="p-4">
                  <ThemeEditor theme={lightTheme} />
                </div>
              </TabItem>
            {/if}
            {#if darkTheme}
              <TabItem title="Dark Theme" open={!lightTheme}>
                <div class="p-4">
                  <ThemeEditor theme={darkTheme} />
                </div>
              </TabItem>
            {/if}
          </Tabs>

          {#if checkUserPolicies([Policies.UPDATE_CUSTOMTHEME], $authStore)}
            <div class="flex justify-end mt-4">
              <CustomButton
                width="20%"
                height="3rem"
                icon={IconRefresh}
                label="Update"
                on:click={updateThemes}
              />
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  {#if showToast}
    <Toast message={toastMessage} type="success" />
  {/if}
</div>
