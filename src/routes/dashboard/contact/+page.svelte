<script lang="ts">
  import { Tabs, TabItem, Label, Input, Button } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import Toast from "$lib/components/Toast.svelte";
  import FullPageLoadingIndicator from "$lib/components/FullPageLoadingIndicator.svelte";
  import type {
    AboutLanguageModel,
    FormDataSet,
  } from "../../../models/aboutModel";
  import { aboutStore } from "../../../stores/aboutStore";
  import { LanguageEnum } from "../../../models/languageEnum";

  const id = 1;
  let showToast = false;
  let isLoading = false;
  const languages: LanguageEnum[] = Object.values(LanguageEnum);

  // fetch data from db
  onMount(async () => {
    let query = await supabase.rpc("get_about_by_id", {
      input_about_id: id,
    });

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
      const aboutLanguageData = languages.map((language, index) => ({
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
</script>

{#if isLoading}
  <FullPageLoadingIndicator />
{:else}
  <div class="pt-5 lg:pt-10 flex justify-center w-full">
    <div class="max-w-screen-md w-full border rounded">
      <Tabs tabStyle="underline" defaultClass="bg-[#D0D0D0] flex  ">
        {#each languages as language}
          <TabItem title={language} open={language === LanguageEnum.EN}>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              <b>Enter data for {language}:</b>
              <div class="mb-6">
                <Label for={`description-${language}`}>Description</Label>
                <div class:error={formData[language].descriptionError}>
                  <Input
                    id={`description-${language}`}
                    bind:value={formData[language].description}
                    placeholder="Enter description"
                    on:input={() => {
                      formData[language].descriptionError = "";
                    }}
                  />
                </div>
                {#if formData[language].descriptionError}
                  <p class="text-red-500">
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
