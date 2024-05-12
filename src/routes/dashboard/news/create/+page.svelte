<script lang="ts">
  import type { FormDataSet } from "./../../../../models/newsModel.ts";
  import TagDropdown from "./../../../../lib/components/TagDropdown.svelte";
  import LanguageNewsTabs from "./../../../../lib/components/languageNewsTabs.svelte";
  import CategoryDropdown from "$lib/components/CategoryDropdown.svelte";
  import SubCategoryDropdown from "$lib/components/SubCategoryDropdown.svelte";
  import { Button } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  // @ts-ignore
  import { v4 as uuidv4 } from "uuid";
  import FullPageLoadingIndicator from "$lib/components/FullPageLoadingIndicator.svelte";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { newsStore } from "../../../../stores/newsStore";

  let isLoading = false;
  let languages = Object.values(LanguageEnum);
  let selectedCategoryIds: number[] = [];
  let selectedSubCategoryIds: number[] = [];
  let selectedTagIds: number[] = [];
  let showToast = false;
  let alertMessage = "";
  let showAlert = false;

 
  let formData: FormDataSet = languages.reduce(
    (acc: FormDataSet, language: LanguageEnum) => {
      acc[language] = {
        title: null,
        subtitle: null,
        description: null,
        image: null,
        video: null,
        imageName: "",
        videoName: "",
        fileError: "",
        titleError: "",
        subtitleError: "",
        descriptionError: "",
      };
      return acc;
    },
    {}
  );

  function handleFileChange(
    event: Event,
    language: string,
    type: "image" | "video"
  ) {
    const input = event.target as HTMLInputElement | null;

    if (input && input.files && input.files.length > 0) {
      if (type === "image") {
        formData[language].image = input.files[0];
        formData[language].imageName = input.files[0].name;
        formData[language].video = null;
        formData[language].videoName = "";
      } else if (type === "video") {
        formData[language].video = input.files[0];
        formData[language].videoName = input.files[0].name;
        formData[language].image = null;
        formData[language].imageName = "";
      }
      formData[language].fileError = "";
    } else {
      if (type === "image") {
        formData[language].image = null;
        formData[language].imageName = "";
      } else if (type === "video") {
        formData[language].video = null;
        formData[language].videoName = "";
      }
    }
  }


  function getRandomString(): string {
    return uuidv4().split("-")[0];
  }

  async function uploadFile(
    file: File,
    language: LanguageEnum
  ): Promise<string> {
    const fileExtension = file.name.split(".").pop() || "";
    const randomPart = getRandomString();
    const fileName = `${language}_${randomPart}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from("news-files")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }

    return `news-files/${fileName}`;
  }

  async function formSubmit() {
    let isValid = true;
    const uploads: Promise<string>[] = [];
    isLoading = true;

    for (const language of languages) {
      if (!formData[language].title?.trim()) {
        formData[language].titleError = "Title is required";
        isValid = false;
      }
      if (!formData[language].subtitle?.trim()) {
        formData[language].subtitleError = "Subtitle is required";
        isValid = false;
      }
      if (!formData[language].description?.trim()) {
        formData[language].descriptionError = "Description is required";
        isValid = false;
      }
      if (!formData[language].image && !formData[language].video) {
        formData[language].fileError = "Either image or video is required";
        isValid = false;
      } else {
        const file = formData[language].image || formData[language].video;
        const uploadPromise = uploadFile(file as File, language);
        uploads.push(uploadPromise);
      }
    }

    if (!selectedCategoryIds.length) {
      alertMessage =
        "At least one category is required. Please select a category before submitting.";
      showAlert = true;
      isValid = false;
    }

    if (!isValid) {
      isLoading = false;
      return;
    }

    try {
      const filePaths = await Promise.all(uploads);
      const newsLanguageData = languages.map((language, index) => ({
        file: filePaths[index],
        title: formData[language].title as string,
        subtitle: formData[language].subtitle as string,
        description: formData[language].description as string,
        language,
      }));

      const newsObject = {};

      const categoryData = selectedCategoryIds.map((id) => ({
        category_id: id,
      }));
      const subcategoryData = selectedSubCategoryIds.map((id) => ({
        subcategory_id: id,
      }));
      const tagData = selectedTagIds.map((id) => ({ tag_id: id }));

      await newsStore.insertNewsData(
        newsObject,
        newsLanguageData,
        categoryData,
        subcategoryData,
        tagData,
        supabase
      );

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/news");
      }, 3000);
    } catch (error) {
      console.error("Error during news insertion:", error);
    } finally {
      isLoading = false;
    }
  }

  function handleCategoryChange(event: { detail: number[] }): void {
    selectedCategoryIds = event.detail;
  }

  function handleSubCategoryChange(event: { detail: number[] }): void {
    selectedSubCategoryIds = event.detail;
  }

  function handleTagChange(event: { detail: number[] }): void {
    selectedTagIds = event.detail;
  }
</script>

<div
  class="pt-5 lg:pt-10 flex flex-col justify-center items-center max-w-screen-lg mx-auto"
>
  <div class="w-full mb-5 flex space-x-4">
    <CategoryDropdown on:categoryChange={handleCategoryChange} />
    <SubCategoryDropdown on:subcategoryChange={handleSubCategoryChange} />
    <TagDropdown on:tagChange={handleTagChange} />
  </div>
  <div class="border rounded w-full">
    <LanguageNewsTabs {languages} {formData} {handleFileChange} />
    <div class="flex justify-end p-4">
      <Button on:click={formSubmit}>Submit</Button>
    </div>
  </div>
  {#if isLoading}
    <FullPageLoadingIndicator />
  {/if}
</div>

{#if showToast}
  <Toast message="New news has been inserted successfully" type="success" />
{/if}
