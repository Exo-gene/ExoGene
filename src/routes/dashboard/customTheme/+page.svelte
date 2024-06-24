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

  let isLoading = false;
  let showToast = false;
  let toastMessage = "";
  let themes: CustomThemeModel[] = [];
  let selectedTheme: CustomThemeModel | null = null;

  // fetch data from db
  onMount(async () => {
    isLoading = true;
    let { data, error } = await supabase.from("customColor").select("*");
    isLoading = false;
    if (data) {
      themes = data;
      selectedTheme = data[0];
    } else if (error) {
      console.error(error);
    }
  });

  function handleThemeSelect(theme: CustomThemeModel) {
    selectedTheme = theme;
  }

  async function updateTheme() {
    if (!selectedTheme) return;
    isLoading = true;
    let { data, error } = await supabase
      .from("customColor")
      .update(selectedTheme)
      .eq("id", selectedTheme.id);

    isLoading = false;
    if (data) {
      toastMessage = "CustomThemeModel updated successfully";
      showToast = true;
      setTimeout(() => {
        showToast = false;
      }, 2000);
    } else if (error) {
      toastMessage = "Error updating theme";
      showToast = true;
      console.error(error);
    }
  }
</script>

{#if isLoading}
  <FullPageLoadingIndicator />
{:else}
  <div class="pt-5 lg:pt-10 flex justify-center w-full">
    <div class="max-w-screen-md w-full">
      <Tabs tabStyle="underline" defaultClass="bg-[#D0D0D0] flex">
        {#each themes as theme}
          <TabItem
            title={theme.theme.charAt(0).toUpperCase() + theme.theme.slice(1)}
            on:click={() => handleThemeSelect(theme)}
            open={selectedTheme && selectedTheme.id === theme.id}
          >
            {#if selectedTheme && selectedTheme.id === theme.id}
              <div class="p-4">
                <div class="flex items-center border-gray-500 border-b-2 py-4">
                  <div
                    class="mx-4 flex flex-col items-center justify-center w-1/2"
                  >
                    <Label
                      style="color:var(--titleColor)"
                      for="mainBackgroundColor"
                      >Main Background
                    </Label>
                    <input
                      type="color"
                      id="mainBackgroundColor"
                      bind:value={selectedTheme.mainBackgroundColor}
                      class="w-full h-12"
                    />
                  </div>
                  <span class="ml-2 w-1/2 text-center"
                    >{selectedTheme.mainBackgroundColor}</span
                  >
                </div>

                {#each Array(7)
                  .fill(0)
                  .map((_, i) => i + 1) as section}
                  <div class="flex items-center mt-10 mb-5">
                    <div
                      class="mx-4 flex flex-col items-center justify-center w-1/2"
                    >
                      <Label
                        style="color:var(--titleColor)"
                        for={"section" + section}
                        >Section {section}
                      </Label>
                      <input
                        type="color"
                        id={"section" + section}
                        bind:value={selectedTheme[`section${section}`]}
                        class="w-full h-12"
                      />
                    </div>
                    <span class="ml-2 w-1/2 text-center"
                      >{selectedTheme[`section${section}`]}</span
                    >
                  </div>
                {/each}

                <div class="flex justify-end">
                  {#if checkUserPolicies([Policies.UPDATE_CUSTOMTHEME], $authStore)}
                    <Button on:click={updateTheme}>Update Theme</Button>
                  {/if}
                </div>
              </div>
            {/if}
          </TabItem>
        {/each}
      </Tabs>
    </div>
  </div>
{/if}

{#if showToast}
  <Toast message={toastMessage} type="success" />
{/if}
