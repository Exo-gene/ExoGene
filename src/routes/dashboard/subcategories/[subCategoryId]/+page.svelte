<script lang="ts">
	import  CategoryDropdown  from '$lib/components/CategoryDropdown.svelte';
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { subCategoriesStore } from "../../../../stores/subcategoriesStore";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import Toast from "$lib/components/Toast.svelte";
  import type { FormDataSet, SubCategoryLanguageModel } from "../../../../models/subCategoryModel";
  import { Tabs, TabItem, Label, Input, Button, Select } from "flowbite-svelte";
  import type { CategoryDataModel } from "../../../../models/categoryModel";
  import FullPageLoadingIndicator from '$lib/components/FullPageLoadingIndicator.svelte';

  let categories: CategoryDataModel[] = [];
  const id = +$page.params.subCategoryId;
  let showToast = false;
  const languages: LanguageEnum[] = Object.values(LanguageEnum);
  let selectedCategoryId: number = 0;
  let isLoading = false;


  // fetch data from db
  onMount(async () => {
    const [subcategoryResult, categoryResult] = await Promise.all([
      supabase.rpc("get_subcategory_by_id", { input_subcategory_id: id }),
      supabase
        .from("categories")
        .select("*,category_translations(*)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
    ]);

    if (subcategoryResult.error) {
      console.error("Error fetching subcategory:", subcategoryResult.error);
      return;
    }
    if (categoryResult.error) {
      console.error("Error fetching categories:", categoryResult.error);
      return;
    }

    // Process categories
    categories = categoryResult.data;

    // Update form data with translations
    subcategoryResult.data[0].subcategory_translations.forEach(
      (translation: SubCategoryLanguageModel) => {
        if (formData[translation.language]) {
          formData[translation.language].title = translation.title;
          formData[translation.language].category_id =
            subcategoryResult.data[0].category_id;
        }
      }
    );

    selectedCategoryId = subcategoryResult.data[0].category_id;
  });


  let formData: FormDataSet = languages.reduce(
    (acc: FormDataSet, language: LanguageEnum) => {
      acc[language] = {
        title: "",
        category_id: 0,
        titleError: "",
      };
      return acc;
    },
    {}
  );


  async function formSubmit() {
    let isValid = true;
       isLoading = true;

    // Perform validation for each language
    languages.forEach((language) => {
      if (!formData[language].title) {
        formData[language].titleError = "Title is required";
        isValid = false;
      }
    });

    if (!isValid) {
      isLoading = false;
      return;
    }

    try {
        const subcategoryLanguageData = languages.map((language, index) => ({
        title: formData[language].title as string, 
        language,
      }));
       const subcategoryObject = {id,category_id:selectedCategoryId};
 
      await subCategoriesStore.updateSubCategoryData(
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
      console.error("Error during category insertion:", error);
    } finally {
      isLoading = false;
    }
  }

 function handleCategoryChange(event: { detail: number }): void {
 selectedCategoryId = event.detail;
}
 
</script>

 {#if isLoading}
  <FullPageLoadingIndicator />
  {:else}
<div class="pt-5 lg:pt-10 flex flex-col justify-center max-w-screen-lg mx-auto">
  <div class="w-44 mb-5">
    <CategoryDropdown  {selectedCategoryId} on:categoryChange={handleCategoryChange} />
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
{/if}

{#if showToast}
  <Toast
    message="This subcategory has been Updated successfully"
    type="success"
  />
{/if}
