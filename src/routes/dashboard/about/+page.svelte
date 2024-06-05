<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Tabs, TabItem, Label, Button } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import Toast from "$lib/components/Toast.svelte";
  import FullPageLoadingIndicator from "$lib/components/FullPageLoadingIndicator.svelte";
  import type {
    AboutLanguageModel,
    FormDataSet,
  } from "../../../models/aboutModel";
  import { aboutStore } from "../../../stores/aboutStore";
  import { LanguageEnum } from "../../../models/languageEnum";
  import QuillEditor from "$lib/components/editor/QuillEditor.svelte";
  import { get } from "svelte/store";

  const id = 1;
  let showToast = false;
  let isLoading = false;
  const languages: LanguageEnum[] = Object.values(LanguageEnum);
  let activeLanguage: LanguageEnum = LanguageEnum.EN;

  onMount(() => {
    async function fetchData() {
      let query = await supabase.rpc("get_about_by_id", { input_about_id: id });

      if (query && query.data) {
        languages.forEach((language) => {
          const translation = query.data[0].about_translations.find(
            (t: AboutLanguageModel) => t.language === language
          );
          if (translation) {
            formData[language].description = translation.description;
          }
        });
      }
    }

    fetchData();
  });

  let formData: FormDataSet = languages.reduce(
    (acc: FormDataSet, language: LanguageEnum) => {
      acc[language] = {
        description: "",
        descriptionError: "",
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
      if (!formData[language].description) {
        formData[language].descriptionError = "Description is required";
        isValid = false;
      }
    });

    if (!isValid) {
      isLoading = false;
      return;
    }

    try {
      const aboutLanguageData = languages.map((language) => ({
        description: formData[language].description as string,
        language,
      }));
      const aboutObject = { id };

      await aboutStore.updateAboutData(
        aboutObject,
        aboutLanguageData,
        supabase
      );

      showToast = true;
      setTimeout(() => {
        showToast = false;
      }, 1000);
    } catch (error) {
      console.error("Error during about insertion:", error);
    } finally {
      isLoading = false;
    }
  }

  function handleTabChange(newTab: any) {
    activeLanguage = newTab;
  }
</script>

{#if isLoading}
  <FullPageLoadingIndicator />
{:else}
  <div class="pt-5 lg:pt-10 flex justify-center w-full">
    <div class={`max-w-screen-md w-full`}>
      <Tabs
        tabStyle="underline"
        defaultClass={`bg-[#D0D0D0] flex`}
        bind:activeItem={activeLanguage}
        on:change={handleTabChange}
      >
        {#each languages as language}
          <TabItem title={language} open={language === activeLanguage}>
            <div class={`text-sm text-gray-500  `}>
              <b style="color: var(--titleColor);">Enter data for {language}:</b
              >
              <div class="my-4">
                <Label
                  style="color: var(--titleColor);"
                  class="my-2"
                  for={`description-${language}`}>Description</Label
                >
                <div class="error">
                  <QuillEditor
                    content={formData[language].description}
                    on:contentChange={(event) =>
                      (formData[language].description = event.detail)}
                  />
                </div>
                {#if formData[language].descriptionError}
                  <p class="text-red-500 dark:text-red-400">
                    {formData[language].descriptionError}
                  </p>
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
  <Toast message="This about has been Updated successfully" type="success" />
{/if}

<style>
</style>
