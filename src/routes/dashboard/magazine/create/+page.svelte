<script lang="ts">
  import FullPageLoadingIndicator from "./../../../../lib/components/FullPageLoadingIndicator.svelte";
  import { magazineStore } from "../../../../stores/magazineStore";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  // @ts-ignore
  import { v4 as uuidv4 } from "uuid";
  import { Tabs, TabItem, Label, Input, Button } from "flowbite-svelte";
  import { Alert } from "flowbite-svelte";
  // @ts-ignore
  import IconAlertTriangle from "@tabler/icons-svelte/IconAlertTriangle.svelte";
  import type { FormData } from "../../../../models/magazineModel";
  // @ts-ignore
  import IconUpload from "@tabler/icons-svelte/IconUpload.svelte";
  import { toUtc } from "$lib/utils/dateTimeFormat";

  let showAlert = false;
  let alertMessage = "";
  let showToast = false;
  let isLoading = false;
  const languages: LanguageEnum[] = Object.values(LanguageEnum);
  let selectedLanguage: LanguageEnum = languages[0]; // Assuming the first language is the default

  let formData: Record<LanguageEnum, FormData> = languages.reduce((acc, language) => {
    acc[language] = {
      pdfFile: null,
      pdfFileName: "",
      pdfFileError: "",
      numberError: "",
      number: 0,
      date: "",
      dateError: "", 
    };
    return acc;
  }, {} as Record<LanguageEnum, FormData>);

  function handleFileChange(event: Event, language: LanguageEnum) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      formData[language].pdfFile = input.files[0];
      formData[language].pdfFileName = input.files[0].name;
      formData[language].pdfFileError = "";
    } else {
      formData[language].pdfFile = null;
      formData[language].pdfFileName = "";
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
      .from("magazine-pdf-file")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }

    // Return the full path where the file was uploaded
    return `magazine-pdf-file/${fileName}`;
  }

  async function formSubmit() {
    isLoading = true;
    let atLeastOneValid = false;
    const magazineLanguageData = [];

    for (const language of languages) {
      let isValid = true;

      if (!formData[language].pdfFile) {
        formData[language].pdfFileError = "File is required";
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
          const file = formData[language].pdfFile;
          let imagePath = "";
          if (file instanceof File) {
            imagePath = await uploadFile(file, language);
          } else {
            console.error(`Expected a File, but received ${typeof file}`);
            isValid = false;
          }

          if (isValid) {
            magazineLanguageData.push({
              pdfFile: imagePath,
              number: formData[language].number,
              date: toUtc(formData[language].date),
              language: language,
            });
            atLeastOneValid = true;
          }
        } catch (error) {
          console.error("Error during magazine insertion:", error);
          showAlert = true;
          alertMessage = "There was an error inserting the magazine. Please try again.";
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

    const magazineObject = {
      // Add any other fields required for the magazine object here
    };

    try {
      await magazineStore.insertMagazineData(magazineObject, magazineLanguageData, supabase);

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/magazine");
      }, 3000);
    } catch (error) {
      console.error("Error during magazine insertion:", error);
      showAlert = true;
      alertMessage = "There was an error inserting the magazine. Please try again.";
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
  <div class="pt-5 lg:pt-10 flex flex-col justify-center max-w-screen-lg mx-auto">
    <div class="w-full">
      <Tabs tabStyle="underline" defaultClass="bg-[#D0D0D0] flex" on:change={(event) => handleTabChange(event.detail)}>
        {#each languages as language}
          <TabItem title={language} open={language === selectedLanguage}>
            <div class="text-sm">
              <b style="color: var(--titleColor);">Enter data for {language}:</b>
              <div class="mb-6 flex justify-between items-start">
                <div class="my-4">
                  <div class="mb-4">
                    <Label style="color: var(--titleColor);" for={`number-${language}`}>Number</Label>
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
                      <p class="text-red-500">{formData[language].numberError}</p>
                    {/if}
                  </div>
                  <div class="mb-4">
                    <Label style="color: var(--titleColor);" for={`date-${language}`}>Date</Label>
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
                    <label class="text-titleColor" for={`image-${language}`}>Pdf File</label>
                    <div class="relative w-full hover:bg-[#D0D0D0] hover:bg-opacity-35 hover:rounded">
                      <Input
                        type="file"
                        accept="application/pdf"
                        id={`image-${language}`}
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        on:change={(event) => handleFileChange(event, language)}
                      />
                      <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-titleColor transition duration-300">
                        <IconUpload stroke={2} class="mx-auto mb-4 w-12 h-12" style="color: var(--titleColor);" />
                        <p style="color: var(--titleColor);">Drop your pdf file here, or <span class="text-titleColor underline">browse</span></p>
                        <p class="text-gray-500 text-sm mt-2">Supports: PDF</p>
                      </div>
                    </div>
                    {#if formData[language].pdfFile}
                      <span class="block mt-2 text-sm text-gray-700">Selected File: {formData[language]?.pdfFile?.name}</span>
                    {/if}
                    {#if formData[language].pdfFileError}
                      <p class="text-red-500 mt-2">{formData[language].pdfFileError}</p>
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
  <Toast message="New carousel has been inserted successfully" type="success" />
{/if}

<div class="pt-5 lg:pt-10 flex flex-col justify-center max-w-screen-lg mx-auto">
  {#if showAlert}
    <Alert class="mb-4 flex items-center">
      <IconAlertTriangle stroke={2} class="text-red-700" />
      {alertMessage}
    </Alert>
  {/if}
</div>
