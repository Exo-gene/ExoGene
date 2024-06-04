<script lang="ts">
  import { Tabs, TabItem, Input, Label, Textarea } from "flowbite-svelte";
  import { LanguageEnum } from "../../models/languageEnum";
  import type { FormDataSet, AdditionalFile } from "../../models/newsModel";
  import { onDestroy, onMount } from "svelte";
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";

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
    if (fileInput.files && fileInput.files.length > 0 && titleInput.value) {
      const newFile = {
        file: fileInput.files[0],
        title: titleInput.value,
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

<Tabs tabStyle="underline" contentClass="tabs-background">
  {#each languages as language (language)}
    <TabItem title={language} open={language === LanguageEnum.EN}>
      <div class="text-sm text-gray-500 dark:text-gray-400 p-2">
        <div>
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
              {#if formData[language].titleError}
                <p class="text-red-500">{formData[language].titleError}</p>
              {/if}
            </div>
          </div>
          <div>
            <Label for={`subtitle-${language}`}>Subtitle</Label>
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
          <div>
            <Label for={`description-${language}`}>Description</Label>
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
            <div>
              <b>Enter image file for {language}:</b>
              <Input
                type="file"
                accept="image/*"
                id={`image-${language}`}
                on:change={(event) =>
                  handleFileChange(event, language, "image")}
              />
              {#if formData[language].image}
                <!-- Display image based on whether it's a File object or a string path -->
                <div class="relative mt-2 border">
                  <img
                    src={getObjectUrl(formData[language].image)}
                    alt={`Image for ${language}`}
                    class="w-44 h-44"
                  />
                  <button
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded p-2"
                    on:click={() => removeImage(language)}
                  >
                    &times;
                  </button>
                </div>
              {:else}
                <p>No image selected for {language}</p>
              {/if}
            </div>
            <div class="border border-gray-500 my-3 rounded"></div>
            <div>
              <b>Enter video file for {language}:</b>
              <Input
                type="file"
                accept="video/*"
                id={`video-${language}`}
                on:change={(event) =>
                  handleFileChange(event, language, "video")}
              />
              {#if formData[language].video}
                <!-- Display video based on whether it's a File object or a string path -->
                <div class="relative mt-2 border rounded">
                  <video
                    src={getObjectUrl(formData[language].video)}
                    alt={`Video for ${language}`}
                    class="w-44 h-44"
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
                <p>No video selected for {language}</p>
              {/if}
            </div>
            {#if formData[language].fileError}
              <p class="text-red-500">{formData[language].fileError}</p>
            {/if}
          </div>
        </div>

        <!-- Additional file section -->
        <div class="p-4 flex space-x-3 border-t-2 rounded w-full">
          <div class="my-5">
            <div class="flex space-x-10">
              <input type="file" id={`additional-file-${language}`} />
              <Input
                type="text"
                id={`additional-title-${language}`}
                placeholder="Enter title"
              />
              <button class="p-3 bg-gray-200" on:click={() => addFile(language)}
                >Add</button
              >
            </div>
            <div class="border my-5">
              <Table>
                <TableHead
                  class="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400"
                >
                  <TableHeadCell>File</TableHeadCell>
                  <TableHeadCell>Title</TableHeadCell>
                  <TableHeadCell>Action</TableHeadCell>
                </TableHead>
                <TableBody tableBodyClass="divide-y">
                  {#each formData[language].additionalFiles as additionalFile, index}
                    <TableBodyRow>
                      <TableBodyCell>
                        <a
                          href={getObjectUrl(additionalFile.file)}
                          target="_blank"
                        >
                          {additionalFile.file instanceof File
                            ? additionalFile.file.name
                            : additionalFile.file}
                        </a>
                      </TableBodyCell>
                      <TableBodyCell>{additionalFile.title}</TableBodyCell>
                      <TableBodyCell>
                        <button
                          class="text-red-500"
                          on:click={() => removeAdditionalFile(language, index)}
                          >Remove</button
                        >
                      </TableBodyCell>
                    </TableBodyRow>
                  {/each}
                </TableBody>
              </Table>
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
    background-color: var(--background-color);
  }
</style>
