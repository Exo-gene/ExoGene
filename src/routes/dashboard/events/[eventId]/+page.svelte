<script lang="ts">
  import FullPageLoadingIndicator from "./../../../../lib/components/FullPageLoadingIndicator.svelte";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { Tabs, TabItem, Label, Input, Button, Select } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  import type {
    EventLanguageModel,
    FormDataSet,
  } from "../../../../models/eventModel";
  import { eventStore } from "../../../../stores/eventsStore";
  import { toUtc, toLocaleDateFormat } from "$lib/utils/dateTimeFormat";
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  let showToast = false;
  let isLoading = false;
  const languages: LanguageEnum[] = Object.values(LanguageEnum);
  let start_date = "";
  let end_date = "";
  let repeat_annually = "false"; // Initialize as string to match dropdown values
  let startDateError = "";
  let endDateError = "";
  let repeatAnnuallyError = "";
  const id = +$page.params.eventId;

  let formData: FormDataSet = languages.reduce(
    (acc: FormDataSet, language: LanguageEnum) => {
      acc[language] = {
        title: "",
        titleError: "",
        descriptionError: "",
        description: "",
      };
      return acc;
    },
    {}
  );

  async function formSubmit() {
    let isValid = true;
    isLoading = true;

    // Reset errors
    startDateError = "";
    endDateError = "";
    repeatAnnuallyError = "";
    languages.forEach((language) => {
      formData[language].titleError = "";
      formData[language].descriptionError = "";
    });

    // Validate title and description for each language
    languages.forEach((language) => {
      if (!formData[language].title) {
        formData[language].titleError = "Title is required";
        isValid = false;
      }
      if (!formData[language].description) {
        formData[language].descriptionError = "Description is required";
        isValid = false;
      }
    });

    // Validate start date and end date
    if (!start_date) {
      startDateError = "Start date and time are required";
      isValid = false;
    }
    if (!end_date) {
      endDateError = "End date and time are required";
      isValid = false;
    }

    // Validate repeat annually
    if (repeat_annually === null) {
      repeatAnnuallyError = "Repeat annually selection is required";
      isValid = false;
    }

    if (!isValid) {
      isLoading = false;
      return;
    }

    try {
      const eventLanguageData = languages.map((language, index) => ({
        title: formData[language].title as string,
        description: formData[language].description as string,
        language,
      }));
      const eventObject = {
        id: id,
        start_date: toUtc(start_date),
        end_date: toUtc(end_date),
        repeat_annually: repeat_annually === "true", // Convert string to boolean for database
      };

      await eventStore.updateEventData(
        eventObject,
        eventLanguageData,
        supabase
      );

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/events");
      }, 1000);
    } catch (error) {
      console.error("Error during event insertion:", error);
    } finally {
      isLoading = false;
    }
  }

  // Fetch data from db
  onMount(async () => {
    let query = await supabase.rpc("get_event_by_id", {
      input_event_id: id,
    });

    if (query && query.data) {
      const eventData = query.data[0];
      start_date = toLocaleDateFormat(eventData.start_date);
      end_date = toLocaleDateFormat(eventData.end_date);
      repeat_annually = eventData.repeat_annually; // Use the string value directly

      languages.forEach((language) => {
        const translation = eventData.event_translations.find(
          (t: EventLanguageModel) => t.language === language
        );
        if (translation) {
          formData[language].title = translation.title;
          formData[language].description = translation.description;
        }
      });
    }
  });
</script>

{#if isLoading}
  <FullPageLoadingIndicator />
{:else}
  <div class="pt-5 lg:pt-10 flex justify-center w-full">
    <div class="max-w-screen-md w-full">
      <div class="flex items-center gap-3">
        <div class="mb-4">
          <Label style="color: var(--titleColor);" class="mb-2" for="start-date"
            >Start Date and Time</Label
          >
          <Input
            class="form-input px-4 py-2 rounded-md border-2 border-gray-300"
            type="datetime-local"
            id="start-date"
            bind:value={start_date}
          />
          {#if startDateError}
            <p class="text-red-500">{startDateError}</p>
          {/if}
        </div>
        <div class="mb-4">
          <Label style="color: var(--titleColor);" class="mb-2" for="end-date"
            >End Date and Time</Label
          >
          <Input
            class="form-input px-4 py-2 rounded-md border-2 border-gray-300"
            type="datetime-local"
            id="end-date"
            bind:value={end_date}
          />
          {#if endDateError}
            <p class="text-red-500">{endDateError}</p>
          {/if}
        </div>
        <div class="mb-4">
          <Label
            style="color: var(--titleColor);"
            class="mb-2"
            for="repeat-annually">Repeat Annually</Label
          >
          <Select
            id="repeat-annually"
            bind:value={repeat_annually}
            class="form-select px-4 py-2 rounded-md border-2 border-gray-300"
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </Select>
          {#if repeatAnnuallyError}
            <p class="text-red-500">{repeatAnnuallyError}</p>
          {/if}
        </div>
      </div>
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

              <div class="mb-6">
                <Label
                  style="color: var(--titleColor);"
                  class="mb-2"
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
  </div>
{/if}

{#if showToast}
  <Toast message="New event has been inserted successfully" type="success" />
{/if}
