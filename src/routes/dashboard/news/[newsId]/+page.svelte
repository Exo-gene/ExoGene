<script lang="ts">
  import type { FormDataSet } from "./../../../../models/newsModel.ts";
  import TagDropdown from "./../../../../lib/components/TagDropdown.svelte";
  import LanguageNewsTabs from "./../../../../lib/components/languageNewsTabs.svelte";
  import { Button, Input, Label } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  import { v4 as uuidv4 } from "uuid";
  import FullPageLoadingIndicator from "$lib/components/FullPageLoadingIndicator.svelte";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import CategoryDropdownToNews from "$lib/components/CategoryDropdownToNews.svelte";
  import { toLocaleDateFormat, toUtc } from "$lib/utils/dateTimeFormat.js";

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
        additionalFiles: [],
      };
      return acc;
    },
    {}
  );

  onMount(async () => {
    try {
      isLoading = true;
      const { data, error } = await supabase.rpc("get_news_by_id", {
        news_id: id,
      });

      if (error) {
        console.error("Error fetching newsData:", error);
        alertMessage = "Failed to load news data";
        showAlert = true;
        return;
      }

      if (data) {
        // Populate main news data
        start_date = data.start_date
          ? toLocaleDateFormat(data.start_date)
          : null;
        end_date = data.end_date ? toLocaleDateFormat(data.end_date) : null;
        repeat_view_count = data.repeat_view_count;
        view_count_interval = data.view_count_interval;
        // Populate categories, subcategories, and tags
        selectedCategoryIds =
          data.categories?.map((c: { category_id: number }) => c.category_id) ||
          [];
        selectedSubCategoryIds =
          data.subcategories?.map(
            (sc: { subcategory_id: number }) => sc.subcategory_id
          ) || [];
        selectedTagIds =
          data.tags?.map((t: { tag_id: number }) => t.tag_id) || [];

        // Populate translations
        if (Array.isArray(data.translations)) {
          data.translations.forEach((translation: any) => {
            const languageData = formData[translation.language as LanguageEnum];
            if (languageData) {
              languageData.title = translation.title;
              languageData.subtitle = translation.subtitle;
              languageData.description = translation.description;

              if (translation.file) {
                const fileParts = translation.file.split("/");
                const fileName = fileParts[fileParts.length - 1];
                const fileExtension = fileName.split(".").pop()?.toLowerCase();

                if (["jpg", "png", "jpeg"].includes(fileExtension!)) {
                  languageData.image = translation.file;
                  languageData.imageName = fileName;
                } else if (["mp4", "avi"].includes(fileExtension!)) {
                  languageData.video = translation.file;
                  languageData.videoName = fileName;
                }
              }

              // Parse additional files
              if (
                translation.additional_files &&
                Array.isArray(translation.additional_files)
              ) {
                languageData.additionalFiles = translation.additional_files
                  .map((fileItem: any) => {
                    try {
                      // Ensure that fileItem is a string
                      if (typeof fileItem === "string") {
                        // Fix the incorrect format of additional_files
                        const sanitizedString = fileItem
                          .replace(/\\"/g, '"')
                          .replace(/^"/, "")
                          .replace(/"$/, "");
                        return JSON.parse(sanitizedString);
                      } else if (Array.isArray(fileItem)) {
                        // Handle array of strings case
                        const jsonString = `{${fileItem.join(",")}}`;
                        return JSON.parse(jsonString);
                      }
                      return null;
                    } catch (e) {
                      console.error(
                        "Error parsing additional file:",
                        fileItem,
                        e
                      );
                      return null;
                    }
                  })
                  .filter((file: any) => file !== null); // Filter out any failed parses
              }
            }
          });
        }
      }
    } catch (err) {
      console.error("Error in onMount:", err);
      alertMessage = "An unexpected error occurred";
      showAlert = true;
    } finally {
      isLoading = false;
    }
  });

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
    if (!file || !file.name) {
      console.error("Invalid file:", file);
      throw new Error("Invalid file provided for upload");
    }

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

    // Validate the view_count_interval if provided
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (view_count_interval && !timePattern.test(view_count_interval)) {
      alertMessage =
        "Invalid time format for View Count Interval. Please use HH:MM.";
      showAlert = true;
      isLoading = false;
      return;
    }

    let isAnyLanguageFilled = false;

    for (const language of languages) {
      const { title, subtitle, description, image, video, additionalFiles } =
        formData[language];

      if (title || subtitle || description || image || video) {
        isAnyLanguageFilled = true;

        if (!title) {
          formData[language].titleError = "Title is required";
          isValid = false;
        }
        if (!subtitle) {
          formData[language].subtitleError = "Subtitle is required";
          isValid = false;
        }
        if (!description) {
          formData[language].descriptionError = "Description is required";
          isValid = false;
        }

        // Upload the main file if it's a new File object
        const mainFile = image || video;
        if (mainFile instanceof File) {
          const uploadPromise = uploadFile(mainFile, language);
          uploads.push(uploadPromise);
        }

        // Upload additional files
        for (const additionalFile of additionalFiles) {
          if (additionalFile.file instanceof File) {
            const uploadPromise = uploadFile(additionalFile.file, language);
            uploads.push(uploadPromise);
          }
        }
      }
    }

    if (!isAnyLanguageFilled) {
      alertMessage =
        "At least one language must have title, subtitle, description, and file (image or video).";
      showAlert = true;
      isLoading = false;
      return;
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

    try {
      const filePaths = await Promise.all(uploads);
      let fileIndex = 0;

      const newsLanguageData = languages.map((language) => {
        const mainFile = formData[language].image || formData[language].video;
        const mainFilePath =
          mainFile instanceof File ? filePaths[fileIndex++] : mainFile;

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

        // Properly format the additional_files as a JSON array string
        const additionalFilesArray = additionalFiles.map((file) =>
          JSON.stringify(file).replace(/"/g, '\\"')
        );
        const additionalFilesString = `{${additionalFilesArray.join(",")}}`;

        return {
          file: mainFilePath,
          title: formData[language].title as string,
          subtitle: formData[language].subtitle as string,
          description: formData[language].description as string,
          language,
          additional_files: additionalFilesString,
        };
      });

      const newsObject: any = {
        repeat_view_count: repeat_view_count || null,
        view_count_interval: view_count_interval || null,
      };

      if (start_date) {
        newsObject.start_date = toUtc(start_date);
      }

      if (end_date) {
        newsObject.end_date = toUtc(end_date);
      }

      const categoryData = selectedCategoryIds.map((id) => ({
        category_id: id,
      }));
      const subcategoryData = selectedSubCategoryIds.map((id) => ({
        subcategory_id: id,
      }));
      const tagData = selectedTagIds.map((id) => ({ tag_id: id }));

      const { data, error } = await supabase.rpc(
        "update_news_and_related_data",
        {
          existing_news_id: id,
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

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/news");
      }, 3000);
    } catch (error) {
      console.error("Error during news update:", error);
      alertMessage = "An error occurred during the update. Please try again.";
      showAlert = true;
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
  {#if isLoading}
    <FullPageLoadingIndicator />
  {:else}
    <div class="w-full mb-5 flex space-x-4">
      <CategoryDropdownToNews
        {selectedCategoryIds}
        {selectedSubCategoryIds}
        on:categoryChange={handleCategoryChange}
      />
      <TagDropdown {selectedTagIds} on:tagChange={handleTagChange} />
    </div>
    <div class="w-full">
      <LanguageNewsTabs {languages} {formData} {handleFileChange} />
      <!-- ////////// -->
      <div class="p-4 flex space-x-3 w-full my-2">
        <div class="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label style="color:var(--titleColor)" for="start_date" class="mb-2"
              >Start Date</Label
            >
            <Input
              class="form-input px-4 py-2 rounded-md border-2 border-gray-300"
              type="datetime-local"
              id="start-date"
              bind:value={start_date}
            />
          </div>
          <div>
            <Label style="color:var(--titleColor)" for="end_date" class="mb-2"
              >End Date</Label
            >
            <Input
              class="form-input px-4 py-2 rounded-md border-2 border-gray-300"
              type="datetime-local"
              id="end-date"
              bind:value={end_date}
            />
          </div>
        </div>
        <div class="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label
              style="color:var(--titleColor)"
              for="repeat_view_count"
              class="mb-2">Repeat View Count</Label
            >
            <Input
              type="number"
              id="repeat_view_count"
              bind:value={repeat_view_count}
              required
            />
          </div>
          <div>
            <Label
              style="color:var(--titleColor)"
              for="view_count_interval"
              class="mb-2">View Count Interval (HH:MM)</Label
            >
            <Input
              type="text"
              id="view_count_interval"
              bind:value={view_count_interval}
              placeholder="HH:MM"
              pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
              required
              class="w-full"
            />
            {#if view_count_interval && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(view_count_interval)}
              <p class="text-red-500">Invalid time format. Please use HH:MM.</p>
            {/if}
          </div>
        </div>
      </div>
      <!---->
      <div class="flex justify-end p-4">
        <Button on:click={formSubmit}>Submit</Button>
      </div>
    </div>
  {/if}
</div>

{#if showToast}
  <Toast message="New news has been updated successfully" type="success" />
{/if}
