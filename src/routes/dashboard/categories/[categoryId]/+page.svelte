<script lang="ts">
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { Tabs, TabItem, Label, Input, Button } from "flowbite-svelte";
  import { categoriesStore } from "../../../../stores/categoriesStore";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import Toast from "$lib/components/Toast.svelte";
  import type {
    CategoryLanguageModel,
    FormDataSet,
  } from "../../../../models/categoryModel";
  import FullPageLoadingIndicator from "$lib/components/FullPageLoadingIndicator.svelte";

  const id = +$page.params.categoryId;
  let showToast = false;
  let isLoading = false;
  const languages: LanguageEnum[] = Object.values(LanguageEnum);

  // fetch data from db
  onMount(async () => {
     isLoading = true;
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
        isLoading = false;
  });

  let formData: FormDataSet = languages.reduce(
    (acc: FormDataSet, language: LanguageEnum) => {
      acc[language] = {
        title: "",
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
      const categoryLanguageData = languages.map((language, index) => ({
        title: formData[language].title as string,
        language,
      }));
      const categoryObject = { id };

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
    } finally {
      isLoading = false;
    }
  }
</script>

{#if isLoading}
  <FullPageLoadingIndicator />
{:else}
  <div class="pt-5 lg:pt-10 flex justify-center w-full">
    <div class="max-w-screen-md w-full">
      <Tabs tabStyle="underline" defaultClass="bg-[#D0D0D0] flex  ">
        {#each languages as language}
          <TabItem title={language} open={language === LanguageEnum.EN}>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              <b style="color: var(--titleColor);">Enter data for {language}:</b
              >
              <div class="my-4">
                <Label
                  style="color: var(--titleColor);"
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
  <Toast message="This category has been Updated successfully" type="success" />
{/if}
