<script lang="ts">
  import FullPageLoadingIndicator from "./../../../../lib/components/FullPageLoadingIndicator.svelte";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { Tabs, TabItem, Label, Input, Button } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  import { tagStore } from "../../../../stores/tagsStore";
  import type { FormDataSet } from "../../../../models/tagModel";

  let showToast = false;
  let isLoading = false;
  const languages: LanguageEnum[] = Object.values(LanguageEnum);

  let formData: FormDataSet = languages.reduce(
    (acc: FormDataSet, language: LanguageEnum) => {
      acc[language] = {
        title: "",
        titleError: "",
      };
      return acc;
    },
    {}
  );

  async function formSubmit() {
    let isValid = true;
    isLoading = true;

    // Perform validation for each language
    languages.forEach((language) => {
      if (!formData[language].title) {
        formData[language].titleError = "Title is required";
        isValid = false;
      }
    });

    if (!isValid) {
      isLoading = false;
      return;
    }

    try {
      const tagLanguageData = languages.map((language, index) => ({
        title: formData[language].title as string,
        language,
      }));
      const tagObject = {};

      await tagStore.insertTagData(tagObject, tagLanguageData, supabase);

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/tags");
      }, 1000);
    } catch (error) {
      console.error("Error during tag insertion:", error);
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
      <Tabs tabStyle="underline" defaultClass="bg-[#D0D0D0] flex  ">
        {#each languages as language}
          <TabItem title={language} open={language === LanguageEnum.EN}>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              <b style="color: var(--titleColor);">Enter data for {language}:</b
              >
              <div class="my-4">
                <Label
                  style="color: var(--titleColor);"
                  class="mb-2"
                  for={`title-${language}`}>Title</Label
                >
                <div class:error={formData[language].titleError}>
                  <Input
                    id={`title-${language}`}
                    bind:value={formData[language].title}
                    placeholder="Enter title"
                    on:input={() => {
                      formData[language].titleError = "";
                    }}
                  />
                </div>
                {#if formData[language].titleError}
                  <p class="text-red-500">{formData[language].titleError}</p>
                {/if}
              </div>
            </div>
          </TabItem>
        {/each}
      </Tabs>
      <div class="flex justify-end p-4">
        <Button on:click={formSubmit}>Submit</Button>
      </div>
    </div>
  </div>
{/if}

{#if showToast}
  <Toast message="New tag has been inserted successfully" type="success" />
{/if}
