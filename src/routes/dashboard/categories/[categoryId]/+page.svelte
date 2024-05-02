<script lang="ts">
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { Tabs, TabItem, Label, Input, Button } from "flowbite-svelte";
  import { categoriesStore } from "../../../../stores/categoriesStore";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import Toast from "$lib/components/Toast.svelte";
  import type { CategoryLanguageModel } from "../../../../models/categoryModel";

  const id = +$page.params.categoryId;
  let showToast = false;
  const languages: LanguageEnum[] = Object.values(LanguageEnum);

  // fetch data from db
  onMount(async () => {
    let query = await supabase.rpc("get_category_by_id", {
      input_category_id: id,
    });

    if (query && query.data) {
      languages.forEach((language) => {
        const translation = query.data[0].category_translations.find(
          (t: CategoryLanguageModel) => t.language === language
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
    id: number;
    category_id: number;
    title: string;
    language: LanguageEnum;
    created_at: Date;
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
    const now = new Date();
    const categoryTranslation: LanguageObject[] = languages.map(
      (language: LanguageEnum) => ({
        id: 0,
        category_id: 0,
        title: formData[language].title,
        language,
        created_at: now,
      })
    );

    return {
      categoryObject: {
        id: 0,
        created_at: now,
        categorytranslation: categoryTranslation,
      },
      categoryLanguageData: categoryTranslation,
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

    const { categoryObject, categoryLanguageData } = prepareDataForSubmission();
    try {
      await categoriesStore.updateCategoryData(
        categoryObject,
        categoryLanguageData,
        supabase
      );

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/categories");
      }, 1000);
    } catch (error) {
      console.error("Error during category insertion:", error);
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
  <Toast message="This category has been Updated successfully" type="success" />
{/if}
