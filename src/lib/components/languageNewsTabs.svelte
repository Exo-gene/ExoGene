<script lang="ts">
  import { Tabs, TabItem, Input, Label, Textarea } from "flowbite-svelte";
  import { LanguageEnum } from "../../models/languageEnum";
  import type { FormDataSet } from "../../models/newsModel";
  import { onDestroy, onMount } from "svelte";

  export let languages: LanguageEnum[];
  export let formData: FormDataSet;
  export let handleFileChange: (
    event: Event,
    language: string,
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

  // Helper function to get the object URL for File objects or return the path for strings
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

  // Force update on mount to ensure all data shows correctly
  onMount(() => {
    // Ensure formData is reactive when component mounts
    formData = { ...formData };
  });

  // Reactive block to ensure updates reflect in the UI
  $: {
    // Trigger reactivity by updating formData
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
                on:input={() => { formData[language].titleError = ""; }}
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
                on:input={() => { formData[language].subtitleError = ""; }}
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
                on:input={() => { formData[language].descriptionError = ""; }}
              />
              {#if formData[language].descriptionError}
                <p class="text-red-500">{formData[language].descriptionError}</p>
              {/if}
            </div>
          </div>
          <div class="border border-gray-500 my-3 rounded"></div>
          <div class="mx-4">
            <p class="text-red-600 mb-2">
              Note: Only one file (image or video) can be entered for each language.
            </p>
            <div>
              <b>Enter image file for {language}:</b>
              <Input
                type="file"
                accept="image/*"
                id={`image-${language}`}
                on:change={(event) => handleFileChange(event, language, "image")}
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
                on:change={(event) => handleFileChange(event, language, "video")}
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
      </div>
    </TabItem>
  {/each}
</Tabs>

<style>
  .tabs-background {
    background-color: var(--background-color);
  }
</style>
 
