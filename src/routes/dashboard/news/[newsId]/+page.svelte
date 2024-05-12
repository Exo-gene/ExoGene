<script lang="ts">
  import type {
    FormDataSet, 
  } from "./../../../../models/newsModel.ts";
  import TagDropdown from "./../../../../lib/components/TagDropdown.svelte";
  import LanguageNewsTabs from "./../../../../lib/components/languageNewsTabs.svelte";
  import CategoryDropdown from "$lib/components/CategoryDropdown.svelte"; 
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
  let selectedSubCategoryIds: number[] = [];
  let selectedTagIds: number[] = [];
  let showToast = false;
  let alertMessage = "";
  let showAlert = false;
  const id = +$page.params.newsId;  // Ensure you define $page or use an alternative approach

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

        selectedCategoryIds = news.categories.map(c => c.category_id).filter(Boolean);
        selectedSubCategoryIds = news.subcategories.map(sc => sc.subcategory_id).filter(Boolean);
        selectedTagIds = news.tags.map((t: any) => t.tag_id);
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

      formData = { ...formData, [language]: newData };
    }
  }

  function getRandomString(): string {
    return uuidv4().split("-")[0];
  }

  async function uploadFile(file: File, language: LanguageEnum) {
    if (!file || !file.name) {
      console.error("No file provided for upload");
      throw new Error("No file provided for upload");
    }

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
    const uploads: Promise<string | null>[] = [];
    isLoading = true;

    for (const language of languages) {
      const langData = formData[language];
      if (!langData.title?.trim()) {
        langData.titleError = "Title is required";
        isValid = false;
      }
      if (!langData.subtitle?.trim()) {
        langData.subtitleError = "Subtitle is required";
        isValid = false;
      }
      if (!langData.description?.trim()) {
        langData.descriptionError = "Description is required";
        isValid = false;
      }

      if (!langData.image && !langData.video) {
        if (!langData.imageName && !langData.videoName) {
          langData.fileError = "Either image or video is required";
          isValid = false;
        }
      } else {
        const file = langData.image || langData.video;
        if (file instanceof File) {
          const uploadPromise = uploadFile(file, language).then(path => path, error => {
            console.error("Upload failed for", language, ":", error);
            return null; // Return null if upload fails
          });
          uploads.push(uploadPromise);
        } else {
          // Keep existing file path if no new file was selected
          uploads.push(Promise.resolve(langData.image || langData.video));
        }
      }
    }

    if (!selectedCategoryIds.length) {
      alertMessage = "At least one category is required. Please select a category before submitting.";
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
        file: filePaths[index] || formData[language].image || formData[language].video, // Use the uploaded path or the existing path
        title: formData[language].title as string,
        subtitle: formData[language].subtitle as string,
        description: formData[language].description as string,
        language,
      }));

      const newsObject = {};

      const categoryData = selectedCategoryIds.map(id => ({ category_id: id }));
      const subcategoryData = selectedSubCategoryIds.map(id => ({ subcategory_id: id }));
      const tagData = selectedTagIds.map(id => ({ tag_id: id }));

      await newsStore.updateNewsData(
         id,
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

  function handleCategoryChange(event: any) {
    selectedCategoryIds = event.detail.categoryIds;
    selectedSubCategoryIds = event.detail.subcategoryIds;
    console.log("Selected Category IDs:", selectedCategoryIds);
    console.log("Selected Subcategory IDs:", selectedSubCategoryIds);
  }

  function handleTagChange(event: { detail: number[] }): void {
    selectedTagIds = event.detail;
  }
</script>


<div
  class="pt-5 lg:pt-10 flex flex-col justify-center items-center max-w-screen-lg mx-auto"
>
  {#if isLoading}
    <FullPageLoadingIndicator />
  {:else}
    <div class="w-full mb-5 flex space-x-4">
    <CategoryDropdown {selectedCategoryIds} {selectedSubCategoryIds} on:categoryChange={handleCategoryChange} />
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
  <Toast message="New news has been updated successfully" type="success" />
{/if}
