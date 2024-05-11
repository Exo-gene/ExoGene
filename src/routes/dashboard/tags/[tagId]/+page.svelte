<script lang="ts">
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { Tabs, TabItem, Label, Input, Button } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import Toast from "$lib/components/Toast.svelte";
  import type { TagLanguageModel } from "../../../../models/tagStore";
  import { tagStore } from "../../../../stores/tagsStore";

  const id = +$page.params.tagId;
  let showToast = false;
  const languages: LanguageEnum[] = Object.values(LanguageEnum);

  // fetch data from db
  onMount(async () => {
    let query = await supabase.rpc("get_tag_by_id", {
      input_tag_id: id,
    });

    if (query && query.data) {
      languages.forEach((language) => {
        const translation = query.data[0].tag_translations.find(
          (t: TagLanguageModel) => t.language === language
        );
        if (translation) {
          formData[language].title = translation.title;
        }
      });
    }
  });

  interface FormData {
    [key: string]: {
      title: string;
      titleError: string;
    };
  }

  interface LanguageObject {
    title: string;
    language: LanguageEnum; 
  }

  let formData: FormData = languages.reduce(
    (acc: FormData, language: LanguageEnum) => {
      acc[language] = {
        title: "",
        titleError: "",
      };
      return acc;
    },
    {}
  );

  // Prepare the data models based on formData for submission
  function prepareDataForSubmission() { 
    const tagTranslation: LanguageObject[] = languages.map(
      (language: LanguageEnum) => ({
        title: formData[language].title,
        language, 
      })
    );

    return {
      tagsObject: {
        id: id, 
      },
      tagLanguageData: tagTranslation,
    };
  }

  async function formSubmit() {
    let isValid = true;
    // Perform validation for each language
    languages.forEach((language) => {
      if (!formData[language].title) {
        formData[language].titleError = "Title is required";
        isValid = false;
      }
    });

    if (!isValid) return;

    const { tagsObject, tagLanguageData } = prepareDataForSubmission();
    try {
      await tagStore.updateTagData(tagsObject, tagLanguageData, supabase);

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/tags");
      }, 1000);
    } catch (error) {
      console.error("Error during tag insertion:", error);
    }
  }
</script>

<div class="pt-5 lg:pt-10 flex justify-center w-full">
  <div class="max-w-screen-md w-full border rounded">
    <Tabs tabStyle="underline" defaultClass="bg-[#D0D0D0] flex  ">
      {#each languages as language}
        <TabItem title={language} open={language === LanguageEnum.EN}>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            <b>Enter data for {language}:</b>
            <div class="mb-6">
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
              </div>
              {#if formData[language].titleError}
                <p class="text-red-500">{formData[language].titleError}</p>
              {/if}
            </div>
          </div>
        </TabItem>
      {/each}
    </Tabs>
    <div class="flex justify-end p-4">
      <Button on:click={formSubmit}>Submit</Button>
    </div>
  </div>
</div>

{#if showToast}
  <Toast message="This tag has been Updated successfully" type="success" />
{/if}
