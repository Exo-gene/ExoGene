<script lang="ts">
  import FullPageLoadingIndicator from "./../../../../lib/components/FullPageLoadingIndicator.svelte";
  import { newspaperStore } from "../../../../stores/newspaperStore";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  // @ts-ignore
  import { v4 as uuidv4 } from "uuid";
  import { Tabs, TabItem, Label, Input, Button } from "flowbite-svelte";
  import { Alert } from "flowbite-svelte";
  import type { FormData } from "../../../../models/newspaperModel";
  import { toUtc } from "$lib/utils/dateTimeFormat";
  import { IconUpload } from "@tabler/icons-svelte";

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
    const newspaperLanguageData = [];

    for (const language of languages) {
      let isValid = true;

      if (!formData[language].pdfFile) {
        formData[language].pdfFileError = "PDF file is required";
        isValid = false;
      }
      if (!formData[language].thumbnailFile) {
        formData[language].thumbnailFileError = "Thumbnail image is required";
        isValid = false;
      }
      if (!formData[language].number) {
        formData[language].numberError = "Number is required";
        isValid = false;
      }
      if (!formData[language].date) {
        formData[language].dateError = "Date is required";
        isValid = false;
      }

      if (isValid) {
        try {
          const pdfFile = formData[language].pdfFile;
          const thumbnailFile = formData[language].thumbnailFile;
          let pdfPath = "";
          let thumbnailPath = "";
          if (pdfFile instanceof File) {
            pdfPath = await uploadFile(pdfFile, language, "magazine-pdf-file");
          } else {
            console.error(`Expected a File, but received ${typeof pdfFile}`);
            isValid = false;
          }
          if (thumbnailFile instanceof File) {
            thumbnailPath = await uploadFile(
              thumbnailFile,
              language,
              "magazine-thumbnails"
            );
          } else {
            console.error(
              `Expected a File, but received ${typeof thumbnailFile}`
            );
            isValid = false;
          }

          if (isValid) {
            newspaperLanguageData.push({
              pdfFile: pdfPath,
              thumbnail: thumbnailPath,
              number: formData[language].number,
              date: toUtc(formData[language].date),
              language: language,
            });
            atLeastOneValid = true;
          }
        } catch (error) {
          console.error("Error during newspaper insertion:", error);
          showAlert = true;
          alertMessage =
            "There was an error inserting the newspaper. Please try again.";
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
      // Add any other fields required for the newspaper object here
    };

    try {
      await newspaperStore.insertNewspaperData(
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
      console.error("Error during newspaper insertion:", error);
      showAlert = true;
      alertMessage =
        "There was an error inserting the newspaper. Please try again.";
    } finally {
      isLoading = false;
    }
  }

  function handleTabChange(language: LanguageEnum) {
    selectedLanguage = language;
  }
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
                      <span class="block mt-2 text-sm text-gray-700"
                        >Selected File: {formData[language]?.pdfFile
                          ?.name}</span
                      >
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
                          Drop your image file here, or <span
                            class="text-titleColor underline">browse</span
                          >
                        </p>
                        <p class="text-gray-500 text-sm mt-2">
                          Supports: JPEG, PNG
                        </p>
                      </div>
                    </div>
                    {#if formData[language].thumbnailFile}
                      <span class="block mt-2 text-sm text-gray-700"
                        >Selected File: {formData[language]?.thumbnailFile
                          ?.name}</span
                      >
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
  <Toast
    message="New newspaper has been inserted successfully"
    type="success"
  />
{/if}

<div class="pt-5 lg:pt-10 flex flex-col justify-center max-w-screen-lg mx-auto">
  {#if showAlert}
    <Alert class="mb-4 flex items-center">
      <IconAlertTriangle stroke={2} class="text-red-700" />
      {alertMessage}
    </Alert>
  {/if}
</div>
