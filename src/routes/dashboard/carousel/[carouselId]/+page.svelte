<script lang="ts">
  import { carouselStore } from "../../../../stores/carouselStore";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  // @ts-ignore
  import { v4 as uuidv4 } from "uuid";
  import { onMount } from "svelte";
  import { Tabs, TabItem, Label, Input, Button, Select } from "flowbite-svelte";
  import { Alert } from "flowbite-svelte";
  import NewsDropdown from "$lib/components/LabDropdown.svelte";
  import { page } from "$app/stores";
  import type { FormDataSet } from "../../../../models/carouselModel";
  import FullPageLoadingIndicator from "$lib/components/FullPageLoadingIndicator.svelte";
  import { IconAlertTriangle, IconUpload } from "@tabler/icons-svelte";

  const id = +$page.params.carouselId;
  let selectedNewsId: number = 0;
  let showAlert = false;
  let alertMessage = "";
  let showToast = false;
  let newsTitle = "";
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
        news_id: 0,
      };
      return acc;
    },
    {}
  );

  // Fetch data from db
  async function fetchNewsById(newsId: number) {
    let { data: newsData, error: newsError } = await supabase
      .from("news")
      .select("*, news_translations(*)")
      .eq("id", newsId);

    if (newsError) {
      console.error("Error fetching news data:", newsError);
      return;
    }

    if (!newsData || newsData.length === 0) {
      console.log("No news data found for the provided ID.");
      return;
    }

    const newsDetails = newsData[0];
    const englishTranslation = newsDetails.news_translations.find(
      (translation: any) => translation.language === "en"
    );

    if (englishTranslation) {
      newsTitle = englishTranslation.title;
    } else {
      console.log("No English translation available.");
    }
  }

  onMount(async () => {
    isLoading = true;
    let { data: carouselData, error } = await supabase.rpc(
      "get_carousel_by_id",
      {
        input_carousel_id: id,
      }
    );

    if (error) {
      console.error("Error fetching data:", error);
      showToast = true;
      return;
    }

    if (!carouselData || carouselData.length === 0) {
      console.log("No carousel data found.");
      return;
    }

    const firstCarouselData = carouselData[0];
    selectedNewsId = firstCarouselData.news_id;

    firstCarouselData.carousel_translations.forEach((translation: any) => {
      if (formData[translation.language]) {
        formData[translation.language].title = translation.title;
        formData[translation.language].description = translation.description;
        formData[translation.language].imageName = translation.image;
        formData[translation.language].news_id = firstCarouselData.news_id;
        formData[translation.language].image = translation.image;
      }
    });
    isLoading = false;
  });

  // Reactively fetch news details when selectedNewsId changes
  $: if (selectedNewsId) {
    fetchNewsById(selectedNewsId);
  }

  function handleFileChange(event: any, language: LanguageEnum) {
    const input = event.target;
    if (input.files && input.files.length > 0) {
      formData[language].image = input.files[0];
      formData[language].imageName = input.files[0].name;
      formData[language].imageError = "";
    } else {
      formData[language].image = null;
      formData[language].imageName = "";
      formData[language].imageError = "File not selected.";
    }
  }

  async function uploadFile(file: File, language: LanguageEnum) {
    const fileExtension = file.name.split(".").pop();
    const randomPart = uuidv4().split("-")[0];
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

    return {
      path: `carousel-images/${fileName}`,
    };
  }

  async function formSubmit() {
    let isValid = true;
    const uploads: Promise<any>[] = [];
    const errors: string[] = [];
    isLoading = true;

    languages.forEach((language) => {
      if (!formData[language].title.trim()) {
        formData[language].titleError = "Title is required";
        isValid = false;
      }
      if (!formData[language].description.trim()) {
        formData[language].descriptionError = "Description is required";
        isValid = false;
      }
      if (!formData[language].image && !formData[language].imageName) {
        formData[language].imageError = "Image is required";
        isValid = false;
      }

      if (isValid) {
        if (formData[language].image instanceof File) {
          const imageFile = formData[language].image as File;
          const uploadPromise = uploadFile(imageFile, language)
            .then(({ path }) => {
              formData[language].image = path;
              return {
                language,
                image: path,
                title: formData[language].title,
                description: formData[language].description,
              };
            })
            .catch((error) => {
              errors.push(
                `Failed to upload image for ${language}: ${error.message}`
              );
              return null;
            });
          uploads.push(uploadPromise);
        } else if (formData[language].imageName) {
          uploads.push(
            Promise.resolve({
              language,
              image: formData[language].imageName,
              title: formData[language].title,
              description: formData[language].description,
            })
          );
        }
      }
    });

    if (!isValid || errors.length > 0) {
      alertMessage = "Please correct the errors before submitting.";
      showAlert = true;
      isLoading = false;
      return;
    }

    try {
      const carouselLanguageData = await Promise.all(uploads);
      const carouselObject = {
        id: id,
        news_id: selectedNewsId,
      };

      const validData = carouselLanguageData.filter((data) => data !== null);
      if (validData.length === 0) {
        throw new Error(
          "No valid data to update. Check file uploads and data entries."
        );
      }

      await carouselStore.updateCarouselData(
        carouselObject,
        validData,
        supabase
      );

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/carousel");
      }, 3000);
    } catch (error) {
      console.error("Error during advertisement update:", error);
      alertMessage = "Update failed: " + error;
      showAlert = true;
    } finally {
      isLoading = false;
    }
  }

  function onNewsSelected(event: any) {
    let newsId = event.detail;
    selectedNewsId = newsId;
    showAlert = false;
    Object.keys(formData).forEach((language) => {
      formData[language].news_id = selectedNewsId;
    });
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
    <NewsDropdown bind:selectedNewsId on:newsChange={onNewsSelected} />
    <div class="my-2">
      <p class="text-gray-400">This carousel is linked to this news</p>
      <a href={`/dashboard/news/${selectedNewsId}`} class="underline"
        >{newsTitle}</a
      >
    </div>
    <div class="w-full">
      <Tabs tabStyle="underline" defaultClass="bg-[#D0D0D0] flex">
        {#each languages as language}
          <TabItem title={language} open={language === LanguageEnum.EN}>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              <b style="color: var(--titleColor);">Enter data for {language}:</b
              >
              <div class="mb-6 flex justify-between items-start">
                <div class="my-4 w-full">
                  <div class="mb-4">
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
                      <p class="text-red-500">
                        {formData[language].titleError}
                      </p>
                    {/if}
                  </div>
                  <div class="mb-4">
                    <Label
                      style="color: var(--titleColor);"
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
                      >Image</label
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
                          class="mx-auto mb-4 w-12 h-12 "
                          style="color: var(--titleColor); "
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

                    {#if formData[language].imageError}
                      <p class="text-red-500 mt-2">
                        {formData[language].imageError}
                      </p>
                    {/if}
                  </div>
                  <div class="">
                    {#if formData[language]?.imageName}
                      <img
                        src={getObjectUrl(formData[language].image)}
                        alt={`Image for ${language}`}
                        class="w-44 h-44 mt-2 rounded"
                      />
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
  <Toast message="Carousel has been updated successfully" type="success" />
{/if}
<div class="pt-5 lg:pt-10 flex flex-col justify-center max-w-screen-lg mx-auto">
  {#if showAlert}
    <Alert class="mb-4 flex items-center">
      <IconAlertTriangle stroke={2} class="text-red-700" />
      {alertMessage}
    </Alert>
  {/if}
</div>
