<script lang="ts">
  import { Tabs, TabItem, Input } from "flowbite-svelte";
  import { LanguageEnum } from "../../models/languageEnum";

  export let languages;
  export let formData;
  export let handleFileChange;
</script>

<Tabs tabStyle="underline" contentClass="tabs-background">
  {#each languages as language}
    <TabItem title={language} open={language === LanguageEnum.EN}>
      <p class="text-red-600 mb-2 p-2">
        Note: Only one file (image or video) can be entered for each language.
      </p>
      <div class="text-sm text-gray-500 dark:text-gray-400 p-2">
        <div class="mb-6 flex justify-between items-start">
          <div class="mb-6">
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
                <span>Selected File: {formData[language].imageName}</span>
                <img
                  src={`${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${formData[language].image}`}
                  alt={`Image for ${language}`}
                  class="w-44 h-44 mt-2"
                />
              {/if}
            </div>
            <div class="border border-gray-500 my-3"></div>
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
                <video
                  src={`${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${formData[language].vedio}`}
                  alt={`Video for ${language}`}
                  class="w-44 h-44 mt-2"
                  controls
                >
                  Your browser does not support the video tag.
                </video>
              {:else}
                <p>No media available for {language} language</p>
              {/if}
            </div>
            {#if formData[language].fileError}
              <p class="text-red-500">{formData[language].fileError}</p>
            {/if}
          </div>
          <div></div>
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
 
