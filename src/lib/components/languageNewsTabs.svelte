<script lang="ts">
  import { Tabs, TabItem, Input, Label, Textarea } from 'flowbite-svelte';
  import { LanguageEnum } from '../../models/languageEnum';
  import type { FormDataSet } from '../../models/newsModel';
  import { onDestroy } from 'svelte';

  export let languages: LanguageEnum[];
  export let formData: FormDataSet;
  export let handleFileChange: (event: Event, language: string, type: 'image' | 'video') => void;

  // Function to remove the selected image
function removeImage(language: string): void {
    formData[language].image = null;
    formData[language].imageName = '';
    formData = { ...formData };
      const inputField = document.getElementById(`image-${language}`);
    if (inputField) {
        inputField.value = '';
    }
}

function removeVideo(language: string): void {
    formData[language].video = null;
    formData[language].videoName = '';
    // Update formData to trigger reactivity
    formData = { ...formData };
    // Reset the input field
    const inputField = document.getElementById(`video-${language}`);
    if (inputField) {
        inputField.value = '';
    }
}


  
  const getObjectUrl = (file: File | null): string => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return '';
  };

  onDestroy(() => {
    languages.forEach(language => {
      if (formData[language].image) {
        URL.revokeObjectURL(getObjectUrl(formData[language].image));
      }
      if (formData[language].video) {
        URL.revokeObjectURL(getObjectUrl(formData[language].video));
      }
    });
  });
</script>


<Tabs tabStyle="underline" contentClass="tabs-background">
  {#each languages as language}
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
            <div class="border border-gray-500 my-3"></div>
            <div>
              <b>Enter video file for {language}:</b>
              <Input
                type="file"
                accept="video/*"
                id={`video-${language}`}
                on:change={(event) => handleFileChange(event, language, "video")}
              />
              {#if formData[language].video}
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
 
