<script lang="ts">
  import NewsDropdown from "$lib/components/LabDropdown.svelte";
  import { Button, Input, Label, TabItem, Tabs } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  import FullPageLoadingIndicator from "$lib/components/FullPageLoadingIndicator.svelte";
  import { toLocaleDateFormat, toUtc } from "$lib/utils/dateTimeFormat.js";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { page } from "$app/stores";
  import { v4 as uuidv4 } from "uuid"; // Import uuid
  import { IconUpload } from "@tabler/icons-svelte";
  import type { FormDataSet } from "../../../../models/popupsModel";

  const id = +$page.params.popupId;
  let isLoading = false;
  let showToast = false;
  let start_date = "";
  let end_date = "";
  let link = "";
  let languages = Object.values(LanguageEnum);
  let selectedNewsId: number = null;

  let formData: FormDataSet = languages.reduce(
    (acc: FormDataSet, language: LanguageEnum) => {
      acc[language] = {
        image: null,
        imageName: "",
        title: "",
        description: "",
        titleError: "",
        descriptionError: "",
        imageError: "",
        news_id: null,
        existingImageUrl: null,
      };
      return acc;
    },
    {} as FormDataSet
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
      link = popup.link;
      // Populate formData with existing data
      popup.translations.forEach((translation: any) => {
        const language = translation.language;
        formData[language] = {
          title: translation.title,
          description: translation.description,
          titleError: "",
          descriptionError: "",
          news_id: popup.news_id,
          existingImageUrl: translation.image,
        };
      });
    }

    isLoading = false;
  });

  function handleFileChange(event: Event, language: LanguageEnum) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      formData[language].image = input.files[0];
      formData[language].imageName = input.files[0].name;
      formData[language].imageError = "";
    } else {
      formData[language].image = null;
      formData[language].imageName = "";
    }
  }

  function getRandomString() {
    return uuidv4().split("-")[0];
  }

  async function uploadFile(file: File, language: LanguageEnum) {
    const fileExtension = file.name.split(".").pop();
    const randomPart = getRandomString();
    const fileName = `${language}_${randomPart}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }

    // Return the full path where the file was uploaded
    return `images/${fileName}`;
  }

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

    // Validation for link and news_id
    if (link && selectedNewsId) {
      isValid = false;
      alert("You can only choose either a Link or a News item, not both.");
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
        link: link,
        news_id: selectedNewsId,
      };

      const popupLanguageData = await Promise.all(
        languages.map(async (language) => {
          let imageUrl = formData[language].existingImageUrl;
          if (formData[language].image) {
            imageUrl = await uploadFile(formData[language].image, language);
          }
          return {
            title: formData[language].title,
            description: formData[language].description,
            language: language,
            image: imageUrl, // Save the image URL
          };
        })
      );

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

  const getObjectUrl = (file: File | string | null): string => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    } else if (typeof file === "string" && file) {
      return `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${file}`;
    }
    return "";
  };
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
      <div class="mb-4">
        <Label for="start-date">Link</Label>
        <Input
          class="form-input px-4 py-2 rounded-md border-2 border-gray-300"
          type="text"
          id="link"
          bind:value={link}
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
              <div class="mb-4">
                <label class="text-titleColor" for={`image-${language}`}
                  >Image (Optional)</label
                >
                <div
                  class="relative w-full hover:bg-[#D0D0D0] hover:bg-opacity-35 hover:rounded"
                >
                  <input
                    type="file"
                    accept="image/*"
                    id={`image-${language}`}
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    on:change={(event) => handleFileChange(event, language)}
                  />
                  <div
                    class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-titleColor transition duration-300"
                  >
                    <IconUpload
                      stroke={2}
                      class="mx-auto mb-4 w-12 h-12"
                      style="color: var(--titleColor);"
                    />
                    <p style="color: var(--titleColor);">
                      Drop your image here, or <span
                        class="text-titleColor underline">browse</span
                      >
                    </p>
                    <p class="text-gray-500 text-sm mt-2">
                      Supports: JPG, JPEG2000, PNG
                    </p>
                  </div>
                </div>
                {#if formData[language].imageName}
                  <span class="block mt-2 text-sm text-gray-700"
                    >Selected File: {formData[language].imageName}</span
                  >
                {/if}
                {#if formData[language].image || formData[language].existingImageUrl}
                  <img
                    src={getObjectUrl(
                      formData[language].image ||
                        formData[language].existingImageUrl
                    )}
                    alt={`Image for ${language}`}
                    class="w-44 h-44 mt-2 rounded"
                  />
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
