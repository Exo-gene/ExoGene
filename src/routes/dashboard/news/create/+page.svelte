<script lang="ts">
  import type { FormDataSet } from "./../../../../models/newsModel.ts";
  import TagDropdown from "./../../../../lib/components/TagDropdown.svelte";
  import LanguageNewsTabs from "./../../../../lib/components/languageNewsTabs.svelte";
  import { Button, Label, Input } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  import { v4 as uuidv4 } from "uuid";
  import FullPageLoadingIndicator from "$lib/components/FullPageLoadingIndicator.svelte";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import CategoryDropdownToNews from "$lib/components/CategoryDropdownToNews.svelte";

  let isLoading = false;
  let languages = Object.values(LanguageEnum);
  let selectedCategoryIds: number[] = [];
  let selectedSubCategoryIds: number[] = [];
  let selectedTagIds: number[] = [];
  let showToast = false;
  let alertMessage = "";
  let showAlert = false;
  let repeat_view_count: any;
  let end_date: any;
  let start_date: any;
  let view_count_interval: any;

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
        additionalFiles: [],
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
      // Validate title, subtitle, and description
      if (!formData[language].title) {
        formData[language].titleError = "Title is required";
        isValid = false;
      }
      if (!formData[language].subtitle) {
        formData[language].subtitleError = "Subtitle is required";
        isValid = false;
      }
      if (!formData[language].description) {
        formData[language].descriptionError = "Description is required";
        isValid = false;
      }

      // Validate file
      if (!formData[language].image && !formData[language].video) {
        formData[language].fileError = "Either image or video is required";
        isValid = false;
      } else {
        const file = formData[language].image || formData[language].video;
        const uploadPromise = uploadFile(file as File, language);
        uploads.push(uploadPromise);
      }

      // Upload additional files
      for (const additionalFile of formData[language].additionalFiles) {
        if (additionalFile.file instanceof File) {
          const uploadPromise = uploadFile(additionalFile.file, language);
          uploads.push(uploadPromise);
        }
      }
    }

    // Validate selected categories
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

    // Prepare data for insertion
    try {
      const filePaths = await Promise.all(uploads);
      let fileIndex = 0;

      const newsLanguageData = languages.map((language) => {
        const mainFile = filePaths[fileIndex++];
        const additionalFiles = formData[language].additionalFiles.map(
          (additionalFile) => {
            if (additionalFile.file instanceof File) {
              return {
                file: filePaths[fileIndex++],
                title: additionalFile.title,
                language: additionalFile.language,
              };
            }
            return additionalFile;
          }
        );

        return {
          file: mainFile,
          title: formData[language].title as string,
          subtitle: formData[language].subtitle as string,
          description: formData[language].description as string,
          language,
          additional_files: additionalFiles,
        };
      });

      const newsObject = {
        start_date: start_date,
        end_date: end_date,
        repeat_view_count: repeat_view_count,
        view_count_interval: view_count_interval,
      };

      const categoryData = selectedCategoryIds.map((id) => ({
        category_id: id,
      }));
      const subcategoryData = selectedSubCategoryIds.map((id) => ({
        subcategory_id: id,
      }));
      const tagData = selectedTagIds.map((id) => ({ tag_id: id }));

      // Call the stored procedure
      const { data, error } = await supabase.rpc(
        "insert_news_and_related_data",
        {
          news_data: newsObject,
          news_lang_data: newsLanguageData,
          category_ids_data: categoryData,
          subcategory_ids_data: subcategoryData,
          tag_ids_data: tagData,
        }
      );

      if (error) {
        throw error;
      }

      // Show success toast
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

  function handleCategoryChange(
    event: CustomEvent<{ categoryIds: number[]; subcategoryIds: number[] }>
  ): void {
    selectedCategoryIds = event.detail.categoryIds;
    selectedSubCategoryIds = event.detail.subcategoryIds;
  }

  function handleTagChange(event: { detail: number[] }): void {
    selectedTagIds = event.detail;
  }
</script>

<div
  class="pt-5 lg:pt-10 flex flex-col justify-center items-center max-w-screen-lg mx-auto"
>
  <div class="w-full mb-5 flex space-x-4">
    <CategoryDropdownToNews on:categoryChange={handleCategoryChange} />
    <TagDropdown on:tagChange={handleTagChange} />
  </div>
  <div class="border rounded w-full">
    <LanguageNewsTabs {languages} {formData} {handleFileChange} />
    <!-- ////////// -->
    <div class="p-4 flex space-x-3 border-t-2 rounded w-full">
      <div class="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label for="start_date" class="mb-2">Start Date</Label>
          <Input type="date" id="start_date" bind:value={start_date} required />
        </div>
        <div>
          <Label for="end_date" class="mb-2">End Date</Label>
          <Input type="date" id="end_date" bind:value={end_date} required />
        </div>
      </div>
      <div class="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label for="repeat_view_count" class="mb-2">Repeat View Count</Label>
          <Input
            type="number"
            id="repeat_view_count"
            bind:value={repeat_view_count}
            required
          />
        </div>
        <div>
          <Label for="view_count_interval" class="mb-2"
            >View Count Interval (HH:MM)</Label
          >
          <Input
            type="number"
            id="view_count_interval"
            bind:value={view_count_interval}
            placeholder="HH:MM"
            pattern="[0-9]{2}:[0-9]{2}"
            required
          />
        </div>
      </div>
    </div>
    <!---->
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
