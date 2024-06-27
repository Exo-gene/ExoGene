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

  let isLoading = false;
  let showToast = false;
  let toastMessage = "";
  let themes: CustomThemeModel[] = [];
  let lightTheme: CustomThemeModel | null = null;
  let darkTheme: CustomThemeModel | null = null;

  // fetch data from db
  onMount(async () => {
    isLoading = true;
    let { data, error } = await supabase.from("customColor").select("*");
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
        supabase.from("customColor").update(lightTheme).eq("id", lightTheme.id)
      );
    }
    if (darkTheme) {
      updates.push(
        supabase.from("customColor").update(darkTheme).eq("id", darkTheme.id)
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

{#if isLoading}
  <FullPageLoadingIndicator />
{:else}
  <div class="pt-5 lg:pt-10 flex justify-center w-full">
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
    </div>
  </div>
  <div class="mt-6 flex justify-center">
    {#if checkUserPolicies([Policies.UPDATE_CUSTOMTHEME], $authStore)}
      <Button on:click={updateThemes}>Update Themes</Button>
    {/if}
  </div>
{/if}

{#if showToast}
  <Toast message={toastMessage} type="success" />
{/if}
