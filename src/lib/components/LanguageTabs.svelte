<script lang="ts">
  import { Tabs, TabItem, Input } from "flowbite-svelte";
  import { LanguageEnum } from "../../models/languageEnum";

  export let languages;
  export let formData;
  export let handleFileChange;
</script>

<Tabs tabStyle="underline" defaultClass="bg-[#D0D0D0] flex">
  {#each languages as language}
    <TabItem title={language} open={language === LanguageEnum.EN}>
      <p class="text-red-600 mb-2">
        Note: Only one file (image or video) can be entered for each language.
      </p>
      <div class="text-sm text-gray-500 dark:text-gray-400">
        <div class="mb-6 flex justify-between items-start">
          <div class="mb-6">
            <div>
              <b>Enter image file for {language}:</b>
              <Input
                type="file"
                accept="image/*"
                id={`image-${language}`}
                on:change={(event) => handleFileChange(event, language, "image")}
              />
              {#if formData[language].imageName}
                <span>Selected File: {formData[language].imageName}</span>
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
              {#if formData[language].videoName}
                <span>Selected File: {formData[language].videoName}</span>
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



