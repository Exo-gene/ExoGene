<script lang="ts">
  import type {
    FormDataSet,
    NewsLanguageModel,
  } from "./../../../../models/newsModel.ts";
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
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  let isLoading = false;
  let languages = Object.values(LanguageEnum);
  let selectedCategoryIds: number[] = [];
  let selectedTagIds: number[] = [];
  let showToast = false;
  let alertMessage = "";
  let showAlert = false;
  const id = +$page.params.newsId;

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

  // Fetch data from the database and populate the form
  onMount(async () => {
    try {
      isLoading = true;
      let { data, error } = await supabase.rpc("get_news_by_id", {
        news_id: id,
      });

      if (error) {
        console.error("Error fetching newsData:", error);
        alertMessage = "Failed to load news data";
        showAlert = true;
        return;
      }

      if (data && typeof data === "object") {
        const news = data;

        // Populate translations into formData
        news.translations.forEach((translation: any) => {
          const languageData = formData[translation.language];
          if (languageData) {
            languageData.title = translation.title;
            languageData.subtitle = translation.subtitle;
            languageData.description = translation.description;

            const fileParts = translation.file.split("/");
            const fileName = fileParts[fileParts.length - 1];
            const fileExtension = fileName.split(".").pop().toLowerCase();

            if (["jpg", "png", "jpeg"].includes(fileExtension)) {
              languageData.image = translation.file;
              languageData.imageName = fileName;
            } else if (["mp4", "avi"].includes(fileExtension)) {
              languageData.video = translation.file;
              languageData.videoName = fileName;
            }
          }
        });

        selectedCategoryIds = news.categories.map((c: any) => c.category_id); // Populate category IDs
        selectedTagIds = news.tags.map((t: any) => t.tag_id); // Populate tag IDs
        selectedSubCategoryIds = news.subcategories.map(
          (sc: any) => sc.subcategory_id
        ); // Populate subcategory IDs
      }
    } catch (err) {
      console.error("Error in onMount:", err);
      alertMessage = "An unexpected error occurred";
      showAlert = true;
    } finally {
      isLoading = false;
    }
  });

  function handleFileChange(event: any, language: any, type: any) {
    const file = event.target.files[0];
    if (file) {
      const newData = { ...formData[language] };

      if (type === "image") {
        newData.image = file;
        newData.imageName = file.name;
        newData.video = null;
        newData.videoName = "";
      } else if (type === "video") {
        newData.video = file;
        newData.videoName = file.name;
        newData.image = null;
        newData.imageName = "";
      }

      newData.fileError = "";

      // Ensuring reactivity by updating formData with the new language-specific data
      formData = { ...formData, [language]: newData };
    }
  }

  function getRandomString(): string {
    return uuidv4().split("-")[0];
  }

  async function uploadFile(file: File, language: LanguageEnum) {
    const fileExtension = file.name.split(".").pop();
    const randomPart = getRandomString();
    const fileName = `${language}_${randomPart}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from("news-files")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

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

      await newsStore.updateNewsData(
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
  onMount(() => {
    console.log(formData);
  });
</script>

<div
  class="pt-5 lg:pt-10 flex flex-col justify-center items-center max-w-screen-lg mx-auto"
>
  {#if isLoading}
    <FullPageLoadingIndicator />
  {:else}
    <div class="w-full mb-5 flex space-x-4">
      <CategoryDropdown
        {selectedCategoryIds}
        on:categoryChange={handleCategoryChange}
      />
      <!-- <SubCategoryDropdown
        {selectedSubCategoryIds}
        on:subcategoryChange={handleSubCategoryChange}
      /> -->
      <TagDropdown {selectedTagIds} on:tagChange={handleTagChange} />
    </div>
    <div class="border rounded w-full">
      <LanguageNewsTabs {languages} {formData} {handleFileChange} />
      <div class="flex justify-end p-4">
        <Button on:click={formSubmit}>Submit</Button>
      </div>
    </div>
  {/if}
</div>

{#if showToast}
  <Toast message="New news has been inserted successfully" type="success" />
{/if}
