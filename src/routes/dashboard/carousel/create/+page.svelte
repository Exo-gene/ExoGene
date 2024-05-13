<script lang="ts">
	import FullPageLoadingIndicator from './../../../../lib/components/FullPageLoadingIndicator.svelte';
  import { carouselStore } from "../../../../stores/carouselStore";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  // @ts-ignore
  import { v4 as uuidv4 } from "uuid";
  import { Tabs, TabItem, Label, Input, Button } from "flowbite-svelte";
  import { Alert } from "flowbite-svelte";
  import IconAlertTriangle from "@tabler/icons-svelte/IconAlertTriangle.svelte";
  import NewsDropdown from "$lib/components/NewsDropdown.svelte";
  import type { FormDataSet } from "../../../../models/carouselModel";

  let selectedNewsId: number = 0;
  let showAlert = false;
  let alertMessage = "";
  let showToast = false;
  let isLoading = false;
  const languages: LanguageEnum[] = Object.values(LanguageEnum);

 

 let formData: FormDataSet = languages.reduce(
    (acc: FormDataSet, language: LanguageEnum) => {
      acc[language] = {
        image: null,
        imageName: "",
        imageError: "",
        titleError: "",
        title: "",
        description: "",
        descriptionError: "",
        news_id:null,
      };
      return acc;
    },
    {}
  );

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
      .from("carousel-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }

    // Return the full path where the file was uploaded
    return `carousel-images/${fileName}`;
  }

  async function formSubmit() {
    let isValid = true;
    const uploads = [];
    isLoading = true;

    // Check if a news item is selected
    if (!selectedNewsId) {
      alertMessage =
        "No news item selected. Please select a news item before submitting.";
      showAlert = true;
      isValid = false;
    }

  for (const language of languages) {
  if (!formData[language].image) {
    formData[language].imageError = "Image is required";
    isValid = false;
  }
  if (!formData[language].title.trim()) {
    formData[language].titleError = "Title is required";
    isValid = false;
  }
  if (!formData[language].description.trim()) {
    formData[language].descriptionError = "Description is required";
    isValid = false;
  }
  if (isValid && formData[language].image) {
    // Ensure the image is not null and is a File before calling uploadFile
    const file = formData[language].image;
    if (file instanceof File) {
      const uploadPromise = uploadFile(file, language);
      uploads.push(uploadPromise);
    } else {
       console.error(`Expected a File, but received ${typeof file}`);
      isValid = false;
    }
  }
}

if (!isValid) {
  isLoading = false;
  return;
}

     if (!isValid) {
      isLoading = false;
      return;
    }

    try {
      // Wait for all file uploads to finish
      const imagePaths = await Promise.all(uploads);

      const carouselLanguageData = languages.map((language, index) => ({
        image: imagePaths[index],
        title: formData[language].title,
        description: formData[language].description,
        language,
        }));

      const carouselObject = {
        news_id: selectedNewsId,
       };

      await carouselStore.insertCarouselData(
        carouselObject,
        carouselLanguageData,
        supabase
      );

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/carousel");
      }, 3000);
    } catch (error) {
      console.error("Error during carousel insertion:", error);
     } finally {
      isLoading = false;
    }
  }

  function onNewsSelected(event: any) {
    selectedNewsId =event.detail  ;
    showAlert = false;
  }
</script>

 {#if isLoading}
    <FullPageLoadingIndicator />
  {:else}
<div class="pt-5 lg:pt-10 flex flex-col justify-center max-w-screen-lg mx-auto">
  <NewsDropdown {selectedNewsId} on:newsChange={onNewsSelected} />
  <div class="border rounded w-full">
    <Tabs tabStyle="underline" defaultClass="bg-[#D0D0D0] flex">
      {#each languages as language}
        <TabItem title={language} open={language === LanguageEnum.EN}>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            <b>Enter data for {language}:</b>
            <div class="mb-6 flex justify-between items-start">
              <div class="mb-6">
                <div>
                  <Label for={`title-${language}`}>Title</Label>
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
                <div>
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
                <div>
                  <Label for={`image-${language}`}>Image</Label>
                  <Input
                   type="file"
                   accept="image/*"
                    id={`image-${language}`}
                    on:change={(event) => handleFileChange(event, language)}
                  />
                  {#if formData[language].imageName}
                    <span>Selected File: {formData[language].imageName}</span>
                  {/if}

                  {#if formData[language].imageError}
                    <p class="text-red-500">{formData[language].imageError}</p>
                  {/if}
                </div>
              </div>
              <div class="">
                <!-- {#if formData[language]?.imageName}
                  <img
                    src={`${formData[language].image}`}
                    alt={`Image for ${language}`}
                    class="w-44 h-44 mt-2"
                  />
                {/if} -->
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
  <Toast message="New news has been inserted successfully" type="success" />
{/if}



<div class="pt-5 lg:pt-10 flex flex-col justify-center max-w-screen-lg mx-auto">
  {#if showAlert}
    <Alert class="mb-4 flex items-center">
      <IconAlertTriangle stroke={2} class="text-red-700" />
      {alertMessage}
    </Alert>
  {/if}
</div>
