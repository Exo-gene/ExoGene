<script lang="ts">
  import FullPageLoadingIndicator from "./../../../../lib/components/FullPageLoadingIndicator.svelte";
  import { newspaperStore } from "../../../../stores/newspaperStore";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  import { v4 as uuidv4 } from "uuid";
  import { Tabs, TabItem, Label, Input, Button } from "flowbite-svelte";
  import { Alert } from "flowbite-svelte";
  import type {
    FormData,
    NewspaperLanguageModelToUpdate,
  } from "../../../../models/newspaperModel";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { toLocaleDate, toUtc } from "$lib/utils/dateTimeFormat";
  import { IconAlertTriangle, IconUpload } from "@tabler/icons-svelte";

  let showAlert = false;
  let alertMessage = "";
  let showToast = false;
  let isLoading = false;
  const languages: LanguageEnum[] = Object.values(LanguageEnum);
  let selectedLanguage: LanguageEnum = languages[0]; // Assuming the first language is the default

  let formData: Record<LanguageEnum, FormData> = languages.reduce(
    (acc, language) => {
      acc[language] = {
        pdfFile: null,
        pdfFileName: "",
        pdfFileError: "",
        thumbnailFile: null,
        thumbnailFileName: "",
        thumbnailFileError: "",
        numberError: "",
        number: undefined,
        date: "",
        dateError: "",
      };
      return acc;
    },
    {} as Record<LanguageEnum, FormData>
  );

  const id = +$page.params.newspaperId;
  onMount(async () => {
    isLoading = true;
    let { data: newspaperData, error } = await supabase.rpc(
      "get_newspaper_by_id",
      {
        input_newspaper_id: id,
      }
    );

    if (error) {
      console.error("Error fetching data:", error);
      showToast = true;
      isLoading = false;
      return;
    }

    if (!newspaperData || newspaperData.length === 0) {
      console.log("No newspaper data found.");
      isLoading = false;
      return;
    }

    const firstnewspaperData = newspaperData[0];
    firstnewspaperData.newspaper_translations.forEach(
      (translation: {
        language: LanguageEnum;
        number: number;
        date: string;
        pdfFile: string;
        thumbnail: string;
      }) => {
        if (formData[translation.language]) {
          formData[translation.language].number = translation.number;
          formData[translation.language].date = toLocaleDate(translation.date);
          formData[translation.language].pdfFile = translation.pdfFile;
          formData[translation.language].pdfFileName = translation.pdfFile
            .split("/")
            .pop();
          formData[translation.language].thumbnailFile = translation.thumbnail;
          formData[translation.language].thumbnailFileName =
            translation.thumbnail.split("/").pop();
        }
      }
    );

    isLoading = false;
  });

  function handleFileChange(
    event: Event,
    language: LanguageEnum,
    fileType: "pdf" | "thumbnail"
  ) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (fileType === "pdf") {
        formData[language].pdfFile = file;
        formData[language].pdfFileName = file.name;
        formData[language].pdfFileError = "";
      } else if (fileType === "thumbnail") {
        formData[language].thumbnailFile = file;
        formData[language].thumbnailFileName = file.name;
        formData[language].thumbnailFileError = "";
      }
    } else {
      if (fileType === "pdf") {
        formData[language].pdfFile = null;
        formData[language].pdfFileName = "";
      } else if (fileType === "thumbnail") {
        formData[language].thumbnailFile = null;
        formData[language].thumbnailFileName = "";
      }
    }
  }

  function getRandomString() {
    return uuidv4().split("-")[0];
  }

  async function uploadFile(
    file: File,
    language: LanguageEnum,
    folder: string
  ) {
    const fileExtension = file.name.split(".").pop();
    const randomPart = getRandomString();
    const fileName = `${language}_${randomPart}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from(folder)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }

    // Return the full path where the file was uploaded
    return `${folder}/${fileName}`;
  }

  async function formSubmit() {
    isLoading = true;
    let atLeastOneValid = false;
    const newspaperLanguageData: NewspaperLanguageModelToUpdate[] = [];

    for (const language of languages) {
      let isValid = true;

      // Ensure required fields are present and valid
      if (!formData[language].pdfFile && !formData[language].pdfFileName) {
        formData[language].pdfFileError = "PDF file is required";
        isValid = false;
      }
      if (
        !formData[language].thumbnailFile &&
        !formData[language].thumbnailFileName
      ) {
        formData[language].thumbnailFileError = "Thumbnail image is required";
        isValid = false;
      }
      if (
        formData[language].number === undefined ||
        formData[language].number === null
      ) {
        formData[language].numberError = "Number is required";
        isValid = false;
      }
      if (!formData[language].date) {
        formData[language].dateError = "Date is required";
        isValid = false;
      }

      if (isValid) {
        try {
          let pdfPath = formData[language].pdfFile as string;
          let thumbnailPath = formData[language].thumbnailFile as string;

          if (formData[language].pdfFile instanceof File) {
            pdfPath = await uploadFile(
              formData[language].pdfFile as File,
              language,
              "magazine-pdf-file"
            );
          }

          if (formData[language].thumbnailFile instanceof File) {
            thumbnailPath = await uploadFile(
              formData[language].thumbnailFile as File,
              language,
              "magazine-thumbnails"
            );
          }

          newspaperLanguageData.push({
            pdfFile: pdfPath,
            thumbnail: thumbnailPath,
            number: formData[language].number!,
            date: toUtc(formData[language].date!),
            language: language,
          });

          atLeastOneValid = true;
        } catch (error) {
          console.error("Error during newspaper update:", error);
          showAlert = true;
          alertMessage =
            "There was an error updating the newspaper. Please try again.";
          isLoading = false;
          return;
        }
      }
    }

    if (!atLeastOneValid) {
      showAlert = true;
      alertMessage = "At least one language must have valid data.";
      isLoading = false;
      return;
    }

    const newspaperObject = {
      id: id,
    };

    try {
      await newspaperStore.updateNewspaperData(
        newspaperObject,
        newspaperLanguageData,
        supabase
      );

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/newspaper");
      }, 3000);
    } catch (error) {
      console.error("Error during newspaper update:", error);
      showAlert = true;
      alertMessage =
        "There was an error updating the newspaper. Please try again.";
    } finally {
      isLoading = false;
    }
  }

  function handleTabChange(language: LanguageEnum) {
    selectedLanguage = language;
  }

  const getObjectUrl = (file: File | string | null): string => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    } else if (typeof file === "string") {
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
    <div class="w-full">
      <Tabs
        tabStyle="underline"
        defaultClass="bg-[#D0D0D0] flex"
        on:change={(event) => handleTabChange(event.detail)}
      >
        {#each languages as language}
          <TabItem title={language} open={language === selectedLanguage}>
            <div class="text-sm">
              <b style="color: var(--titleColor);">Enter data for {language}:</b
              >
              <div class="mb-6 flex justify-between items-start">
                <div class="my-4 w-full">
                  <div class="mb-4">
                    <Label
                      style="color: var(--titleColor);"
                      for={`number-${language}`}>Number</Label
                    >
                    <div class:error={formData[language].numberError}>
                      <Input
                        id={`number-${language}`}
                        bind:value={formData[language].number}
                        placeholder="Enter number"
                        on:input={() => {
                          formData[language].numberError = "";
                        }}
                      />
                    </div>
                    {#if formData[language].numberError}
                      <p class="text-red-500">
                        {formData[language].numberError}
                      </p>
                    {/if}
                  </div>
                  <div class="mb-4">
                    <Label
                      style="color: var(--titleColor);"
                      for={`date-${language}`}>Date</Label
                    >
                    <div class:error={formData[language].dateError}>
                      <Input
                        type="date"
                        id={`date-${language}`}
                        bind:value={formData[language].date}
                        placeholder="Enter date"
                        on:input={() => {
                          formData[language].dateError = "";
                        }}
                      />
                    </div>
                    {#if formData[language].dateError}
                      <p class="text-red-500">{formData[language].dateError}</p>
                    {/if}
                  </div>
                  <div class="mb-4">
                    <label class="text-titleColor" for={`pdfFile-${language}`}
                      >PDF File</label
                    >
                    <div
                      class="relative w-full hover:bg-[#D0D0D0] hover:bg-opacity-35 hover:rounded"
                    >
                      <Input
                        type="file"
                        accept="application/pdf"
                        id={`pdfFile-${language}`}
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        on:change={(event) =>
                          handleFileChange(event, language, "pdf")}
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
                          Drop your PDF file here, or <span
                            class="text-titleColor underline">browse</span
                          >
                        </p>
                        <p class="text-gray-500 text-sm mt-2">Supports: PDF</p>
                      </div>
                    </div>
                    {#if formData[language].pdfFile}
                      <span class="block mt-2 text-sm text-gray-700">
                        Selected File: <a
                          href={getObjectUrl(formData[language].pdfFile)}
                          target="_blank"
                          class="text-orange-500 underline"
                          >{formData[language].pdfFileName}</a
                        >
                      </span>
                    {/if}
                    {#if formData[language].pdfFileError}
                      <p class="text-red-500 mt-2">
                        {formData[language].pdfFileError}
                      </p>
                    {/if}
                  </div>
                  <div class="mb-4">
                    <label
                      class="text-titleColor"
                      for={`thumbnailFile-${language}`}>Thumbnail Image</label
                    >
                    <div
                      class="relative w-full hover:bg-[#D0D0D0] hover:bg-opacity-35 hover:rounded"
                    >
                      <Input
                        type="file"
                        accept="image/*"
                        id={`thumbnailFile-${language}`}
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        on:change={(event) =>
                          handleFileChange(event, language, "thumbnail")}
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
                          Drop your thumbnail file here, or <span
                            class="text-titleColor underline">browse</span
                          >
                        </p>
                        <p class="text-gray-500 text-sm mt-2">
                          Supports: JPEG, PNG
                        </p>
                      </div>
                    </div>
                    {#if formData[language].thumbnailFile}
                      <span class="block mt-2 text-sm text-gray-700">
                        Selected File: <a
                          href={getObjectUrl(formData[language].thumbnailFile)}
                          target="_blank"
                          class="text-orange-500 underline"
                          >{formData[language].thumbnailFileName}</a
                        >
                      </span>
                    {/if}
                    {#if formData[language].thumbnailFileError}
                      <p class="text-red-500 mt-2">
                        {formData[language].thumbnailFileError}
                      </p>
                    {/if}
                  </div>
                </div>
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
  <Toast message="Newspaper has been updated successfully" type="success" />
{/if}

<div class="pt-5 lg:pt-10 flex flex-col justify-center max-w-screen-lg mx-auto">
  {#if showAlert}
    <Alert class="mb-4 flex items-center">
      <IconAlertTriangle stroke={2} class="text-red-700" />
      {alertMessage}
    </Alert>
  {/if}
</div>
