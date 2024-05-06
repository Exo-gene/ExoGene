<script lang="ts">
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  import { subCategoriesStore } from "../../../../stores/subcategoriesStore";
  import { onMount } from "svelte";
  import { Tabs, TabItem, Label, Input, Button, Select } from "flowbite-svelte";
  import type { CategoryLanguageModel } from "../../../../models/categoryModel";

  let categories: CategoryDataModel[] = [];
  let selectedCategoryId: number = 0;
  let showToast = false;
  const languages: LanguageEnum[] = Object.values(LanguageEnum);

  interface CategoryDataModel {
    id: number;
    created_at: Date;
    deleted_at: Date;
    category_translations: CategoryLanguageModel[];
  }

  interface FormData {
    [key: string]: {
      title: string;
      category_id: number;
      titleError: string;
    };
  }

  interface LanguageObject {
    title: string;
    language: LanguageEnum;
    created_at: Date;
  }

  let formData: FormData = languages.reduce(
    (acc: FormData, language: LanguageEnum) => {
      acc[language] = {
        title: "",
        category_id: 0,
        titleError: "",
      };
      return acc;
    },
    {}
  );

  // Prepare the data models based on formData for submission
  function prepareDataForSubmission() {
    const now = new Date();
    const subcategoryTranslation: LanguageObject[] = languages.map(
      (language: LanguageEnum) => ({
        title: formData[language].title,
        language,
        created_at: now,
      })
    );

    return {
      subcategoryObject: {
        category_id: selectedCategoryId,
        created_at: now,
      },
      subcategoryLanguageData: subcategoryTranslation,
    };
  }

  async function formSubmit() {
    let isValid = true;
    languages.forEach((language) => {
      if (!formData[language].title) {
        formData[language].titleError = "Title is required";
        isValid = false;
      }
    });

    if (selectedCategoryId === 0) {
      console.error("Category ID not selected");
      isValid = false;
    }

    if (!isValid) return;

    const { subcategoryObject, subcategoryLanguageData } =
      prepareDataForSubmission();
    try {
      await subCategoriesStore.insertSubCategoryData(
        subcategoryObject,
        subcategoryLanguageData,
        supabase
      );

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/subcategories");
      }, 1000);
    } catch (error) {
      console.error("Error during subcategory insertion:", error);
    }
  }

  onMount(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*,category_translations(*)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    categories = data as CategoryDataModel[];
    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      console.log("Fetched categories data:", data);
    }
  });

  function handleCategoryChange(e: Event) {
    const input = e.target as HTMLInputElement;
    selectedCategoryId = parseInt(input.value);
    Object.keys(formData).forEach((language) => {
      formData[language].category_id = selectedCategoryId;
    });
  }
</script>

<div class="pt-5 lg:pt-10 flex flex-col justify-center max-w-screen-lg mx-auto">
  <div class="w-44 mb-5">
    <Label for="category-select">Select Category</Label>
    <Select id="category-select" on:change={handleCategoryChange}>
      {#each categories as category}
        {#if category.category_translations.find((t) => t.language === "en")?.title}
          <option value={category.id}>
            {category.category_translations.find((t) => t.language === "en")
              ?.title}
          </option>
        {/if}
      {/each}
    </Select>
  </div>
  <div class="border rounded w-full">
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
  <Toast
    message="New subcategory has been inserted successfully"
    type="success"
  />
{/if}
