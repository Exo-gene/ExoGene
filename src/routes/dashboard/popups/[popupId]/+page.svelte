<script lang="ts">
  import NewsDropdown from "$lib/components/NewsDropdown.svelte";
  import { Button, Input, Label, TabItem, Tabs } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  import FullPageLoadingIndicator from "$lib/components/FullPageLoadingIndicator.svelte";
  import { toLocaleDateFormat, toUtc } from "$lib/utils/dateTimeFormat.js";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { popupsStore } from "../../../../stores/popupsStore";
  import { page } from "$app/stores";
  import type { FormDataSet } from "../../../../models/popupsModel";

  const id = +$page.params.popupId;
  let isLoading = false;
  let showToast = false;
  let start_date = "";
  let end_date = "";
  let languages = Object.values(LanguageEnum);
  let selectedNewsId: number = 0;

  let formData: FormDataSet = languages.reduce(
    (acc: FormDataSet, language: LanguageEnum) => {
      acc[language] = {
        title: "",
        description: "",
        titleError: "",
        descriptionError: "",
        news_id: null,
      };
      return acc;
    },
    {}
  );

  onMount(async () => {
    isLoading = true;

    const { data: popupData, error: popupError } = await supabase.rpc(
      "get_popup_by_id",
      {
        input_popup_id: id,
      }
    );

    if (popupError) {
      console.error("Error fetching popup data:", popupError);
      showToast = true;
    } else if (popupData && popupData.length > 0) {
      const popup = popupData[0];

      // Convert UTC dates to local dates
      start_date = toLocaleDateFormat(popup.start_date);
      end_date = toLocaleDateFormat(popup.end_date);

      selectedNewsId = popup.news_id;

      // Populate formData with existing data
      popup.translations.forEach((translation: any) => {
        const language = translation.language;
        formData[language] = {
          title: translation.title,
          description: translation.description,
          titleError: "",
          descriptionError: "",
          news_id: popup.news_id,
        };
      });
    }

    isLoading = false;
  });

  function onNewsSelected(event: CustomEvent) {
    selectedNewsId = event.detail;
  }

  async function formSubmit() {
    let isValid = true;
    let atLeastOneValid = false;

    // Reset error messages
    languages.forEach((language) => {
      formData[language].titleError = "";
      formData[language].descriptionError = "";
    });

    // Validation logic
    languages.forEach((language) => {
      if (formData[language].title && formData[language].description) {
        atLeastOneValid = true;
      } else {
        if (!formData[language].title) {
          formData[language].titleError = "Title is required";
        }
        if (!formData[language].description) {
          formData[language].descriptionError = "Description is required";
        }
      }
    });

    if (!atLeastOneValid) {
      isValid = false;
      alert("Title and description are required for at least one language.");
    }

    if (!start_date) {
      isValid = false;
      alert("Start date is required");
    }

    if (!end_date) {
      isValid = false;
      alert("End date is required");
    }

    if (!isValid) {
      isLoading = false;
      return;
    }

    isLoading = true;

    try {
      const popupsObject = {
        id, // Include the ID for updating
        start_date: toUtc(start_date),
        end_date: toUtc(end_date),
        news_id: selectedNewsId,
      };

      const popupLanguageData = languages.map((language) => ({
        title: formData[language].title,
        description: formData[language].description,
        language: language,
      }));

      await supabase.rpc("update_popups", {
        popup_data: popupsObject,
        popup_lang_data: popupLanguageData,
      });

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/popups");
      }, 3000);
    } catch (error) {
      console.error("Error during popup update:", error);
    } finally {
      isLoading = false;
    }
  }
</script>

{#if isLoading}
  <FullPageLoadingIndicator />
{:else}
  <div
    class="pt-5 lg:pt-10 flex flex-col justify-center max-w-screen-lg mx-auto"
  >
    <div class="w-full mb-5 flex space-x-4">
      <div class="mb-4">
        <Label for="start-date">Start Date</Label>
        <Input
          class="form-input px-4 py-2 rounded-md border-2 border-gray-300"
          type="datetime-local"
          id="start-date"
          bind:value={start_date}
        />
      </div>
      <div class="mb-4">
        <Label for="end-date">End Date</Label>
        <Input
          class="form-input px-4 py-2 rounded-md border-2 border-gray-300"
          type="datetime-local"
          id="end-date"
          bind:value={end_date}
        />
      </div>
      <div class="mt-3">
        <NewsDropdown bind:selectedNewsId on:newsChange={onNewsSelected} />
      </div>
    </div>
    <div class="w-full">
      <Tabs tabStyle="underline" defaultClass="bg-[#D0D0D0] flex">
        {#each languages as language}
          <TabItem title={language} open={language === LanguageEnum.EN}>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              <b style="color: var(--titleColor);">Enter data for {language}:</b
              >
              <div class="my-4">
                <Label
                  style="color: var(--titleColor);"
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
              <div class="my-4">
                <Label
                  style="color: var(--descriptionColor);"
                  for={`description-${language}`}>Description</Label
                >
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
    {#if isLoading}
      <FullPageLoadingIndicator />
    {/if}
  </div>
{/if}

{#if showToast}
  <Toast message="Popup has been updated successfully" type="success" />
{/if}

<style>
  .form-input {
    width: 100%;
  }
  .text-red-500 {
    color: red;
  }
</style>
