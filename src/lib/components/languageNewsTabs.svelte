<script lang="ts">
  import {
    Tabs,
    TabItem,
    Input,
    Label,
    Textarea,
    Button,
  } from "flowbite-svelte";
  import { LanguageEnum } from "../../models/languageEnum";
  import type { FormDataSet } from "../../models/newsModel";
  import { onDestroy, onMount } from "svelte";
  import { IconPlus, IconUpload } from "@tabler/icons-svelte";

  export let languages: LanguageEnum[];
  export let formData: FormDataSet;

  export let handleFileChange: (
    event: Event,
    language: LanguageEnum,
    type: "image" | "video"
  ) => void;

  // Function to remove the selected image
  function removeImage(language: string): void {
    formData[language].image = null;
    formData[language].imageName = "";
    formData = { ...formData };
  }

  // Function to remove the selected video
  function removeVideo(language: string): void {
    formData[language].video = null;
    formData[language].videoName = "";
    formData = { ...formData };
  }

  // Function to add a new file with a title
  function addFile(language: string): void {
    const fileInput = document.getElementById(
      `additional-file-${language}`
    ) as HTMLInputElement;
    const titleInput = document.getElementById(
      `additional-title-${language}`
    ) as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const newFile = {
        file: fileInput.files[0],
        title: titleInput.value || "",
        language: language,
      };
      formData[language].additionalFiles.push(newFile);
      formData = { ...formData };
      fileInput.value = "";
      titleInput.value = "";
    }
  }

  // Function to remove an additional file
  function removeAdditionalFile(language: string, index: number): void {
    formData[language].additionalFiles.splice(index, 1);
    formData = { ...formData };
  }

  // Function to create FormData object
  function createFormData(language: string): globalThis.FormData {
    const formDataObject = new FormData();

    // Append other form data fields
    formDataObject.append("title", formData[language].title || "");
    formDataObject.append("subtitle", formData[language].subtitle || "");
    formDataObject.append("description", formData[language].description || "");

    // Append image and video if they exist
    if (formData[language].image instanceof File) {
      formDataObject.append("image", formData[language]?.image);
    }
    if (formData[language].video instanceof File) {
      formDataObject.append("video", formData[language]?.video);
    }

    // Append additional files
    formData[language].additionalFiles.forEach((additionalFile, index) => {
      if (additionalFile.file instanceof File) {
        formDataObject.append(`additionalFiles[${index}]`, additionalFile.file);
      }
      formDataObject.append(
        `additionalFiles[${index}][title]`,
        additionalFile.title
      );
      formDataObject.append(
        `additionalFiles[${index}][language]`,
        additionalFile.language
      );
    });

    return formDataObject;
  }

  // Function to get the object URL for File objects or return the path for strings
  const getObjectUrl = (file: File | string | null): string => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    } else if (typeof file === "string") {
      // Directly use the full URL if it's a string
      return `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${file}`;
    }
    return "";
  };

  // Cleanup object URLs to avoid memory leaks
  onDestroy(() => {
    languages.forEach((language) => {
      if (formData[language].image instanceof File) {
        URL.revokeObjectURL(getObjectUrl(formData[language].image));
      }
      if (formData[language].video instanceof File) {
        URL.revokeObjectURL(getObjectUrl(formData[language].video));
      }
    });
  });

  onMount(() => {
    formData = { ...formData };
  });

  $: {
    formData = { ...formData };
  }
</script>

<Tabs tabStyle="underline" defaultClass="bg-[#D0D0D0] flex">
  {#each languages as language (language)}
    <TabItem title={language} open={language === LanguageEnum.EN}>
      <div class="text-sm text-gray-500 dark:text-gray-400 p-2">
        <div>
          <div class="mb-4">
            <Label
              style="color: var(--titleColor);"
              class="mb-2"
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
              {#if formData[language].titleError}
                <p class="text-red-500">{formData[language].titleError}</p>
              {/if}
            </div>
          </div>
          <div class="mb-4">
            <Label
              style="color: var(--titleColor);"
              class="mb-2"
              for={`subtitle-${language}`}>Subtitle</Label
            >
            <div class:error={formData[language].subtitleError}>
              <Input
                id={`subtitle-${language}`}
                bind:value={formData[language].subtitle}
                placeholder="Enter subtitle"
                on:input={() => {
                  formData[language].subtitleError = "";
                }}
              />
              {#if formData[language].subtitleError}
                <p class="text-red-500">{formData[language].subtitleError}</p>
              {/if}
            </div>
          </div>
          <div class="mb-4">
            <Label
              style="color: var(--titleColor);"
              class="mb-2"
              for={`description-${language}`}>Description</Label
            >
            <div class:error={formData[language].descriptionError}>
              <Textarea
                id={`description-${language}`}
                bind:value={formData[language].description}
                placeholder="Enter description"
                on:input={() => {
                  formData[language].descriptionError = "";
                }}
              />
              {#if formData[language].descriptionError}
                <p class="text-red-500">
                  {formData[language].descriptionError}
                </p>
              {/if}
            </div>
          </div>
          <div class="border border-gray-500 my-3 rounded"></div>
          <div class="mx-4">
            <p class="text-red-600 mb-2">
              Note: Only one file (image or video) can be entered for each
              language.
            </p>

            <div class="flex items-start">
              <div class="mr-4">
                <b style="color: var(--titleColor);"
                  >Enter image file for {language}:</b
                >
                <div
                  class="my-2 relative w-full hover:bg-[#D0D0D0] hover:bg-opacity-35 hover:rounded"
                >
                  <Input
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    type="file"
                    accept="image/*"
                    id={`image-${language}`}
                    on:change={(event) =>
                      handleFileChange(event, language, "image")}
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
                      Drop your image here, or <span
                        class="text-titleColor underline">browse</span
                      >
                    </p>
                    <p class="text-gray-500 text-sm mt-2">
                      Supports: JPG, JPEG2000, PNG
                    </p>
                  </div>
                </div>
              </div>

              <div style="height: 200px;">
                {#if formData[language].image}
                  <!-- Display image based on whether it's a File object or a string path -->
                  <div class="relative mt-8 border rounded">
                    <img
                      src={getObjectUrl(formData[language].image)}
                      alt={`Image for ${language}`}
                      class="w-44 h-40 rounded"
                    />
                    <button
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded p-2"
                      on:click={() => removeImage(language)}
                    >
                      &times;
                    </button>
                  </div>
                {:else}
                  <p class="flex items-center justify-center h-full">
                    No image selected for {language}
                  </p>
                {/if}
              </div>
            </div>

            <div class="border border-gray-500 my-3 rounded"></div>

            <div class="flex items-start">
              <div class="mr-4">
                <b style="color: var(--titleColor);"
                  >Enter video file for {language}:</b
                >
                <div
                  class="my-2 relative w-full h-full hover:bg-[#D0D0D0] hover:bg-opacity-35 hover:rounded"
                >
                  <Input
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    type="file"
                    accept="video/*"
                    id={`video-${language}`}
                    on:change={(event) =>
                      handleFileChange(event, language, "video")}
                  />
                  <div
                    class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-titleColor transition duration-300 h-full"
                  >
                    <IconUpload
                      stroke={2}
                      class="mx-auto mb-4 w-12 h-12"
                      style="color: var(--titleColor);"
                    />
                    <p style="color: var(--titleColor);">
                      Drop your video here, or <span
                        class="text-titleColor underline">browse</span
                      >
                    </p>
                    <p class="text-gray-500 text-sm mt-2">Supports: Mp4</p>
                  </div>
                </div>
              </div>

              <div style="height: 200px;">
                {#if formData[language].video}
                  <!-- Display video based on whether it's a File object or a string path -->
                  <div class="relative mt-8 border rounded">
                    <video
                      src={getObjectUrl(formData[language].video)}
                      alt={`Video for ${language}`}
                      class="w-44 h-40 rounded"
                      controls
                    >
                      Your browser does not support the video tag.
                    </video>
                    <button
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded p-2"
                      on:click={() => removeVideo(language)}
                    >
                      &times;
                    </button>
                  </div>
                {:else}
                  <p class="flex items-center justify-center h-full">
                    No video selected for {language}
                  </p>
                {/if}
              </div>
            </div>

            {#if formData[language].fileError}
              <p class="text-red-500">{formData[language].fileError}</p>
            {/if}
          </div>
        </div>

        <div class="border border-gray-500 my-3 mx-4 rounded"></div>
        <!-- Additional file section -->
        <div class="p-4 w-full">
          <div class="my-5">
            <label class="text-titleColor">Add additional files</label>
            <div class="flex space-x-4 mt-4">
              <input
                type="file"
                id={`additional-file-${language}`}
                class="p-2 border rounded"
              />
              <Input
                type="text"
                id={`additional-title-${language}`}
                placeholder="Enter title"
                class="p-2 border rounded flex-grow"
              />
              <Button class="p-2 rounded" on:click={() => addFile(language)}>
                <IconPlus stroke={2} />
              </Button>
            </div>
            <div class="border my-5 overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >File</th
                    >
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >Title</th
                    >
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >Action</th
                    >
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  {#each formData[language].additionalFiles as additionalFile, index}
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap">
                        {#if additionalFile.file && additionalFile.file.type && additionalFile.file.type.startsWith("image/")}
                          <img
                            src={getObjectUrl(additionalFile.file)}
                            alt={additionalFile.title || "Additional file"}
                            class="w-20 h-20 object-cover rounded"
                          />
                        {:else if additionalFile.file && additionalFile.file.type && additionalFile.file.type.startsWith("video/")}
                          <video
                            src={getObjectUrl(additionalFile.file)}
                            class="w-20 h-20 object-cover rounded"
                            controls
                          >
                            Your browser does not support the video tag.
                          </video>
                        {:else}
                          <img
                            src={getObjectUrl(additionalFile.file)}
                            alt={additionalFile.title || "Additional file"}
                            class="w-20 h-20 object-cover rounded"
                          />
                        {/if}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        {additionalFile.title}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <button
                          class="text-red-500"
                          on:click={() => removeAdditionalFile(language, index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- End additional file section -->
      </div>
    </TabItem>
  {/each}
</Tabs>

<style>
  .tabs-background {
    background-color: var(--mainBackgroundColor);
  }
</style>
