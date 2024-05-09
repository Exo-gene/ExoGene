<script lang="ts">
  import LanguageTabs from "$lib/components/LanguageTabs.svelte";
  import CategoryDropdown from "$lib/components/CategoryDropdown.svelte";
  import SubCategoryDropdown from "$lib/components/SubCategoryDropdown.svelte";
  import { Button, Label } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  // @ts-ignore
  import { v4 as uuidv4 } from "uuid";
  import FullPageLoadingIndicator from "$lib/components/FullPageLoadingIndicator.svelte";
  import { toUtc } from "$lib/utils/dateTimeFormat.js";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { newsStore } from "../../../../stores/newsStore";

  let isLoading = false;
  let categories: any = [];
  let languages = Object.values(LanguageEnum);
  let selectedCategoryIds: any[] = [];
  let selectedSubCategoryIds: any[] = [];
  let showToast = false;
  let alertMessage = "";
  let showAlert = false;

  let formData: any = languages.reduce((acc, language) => {
    acc[language] = {
      image: null,
      video: null,
      imageName: "",
      videoName: "",
      fileError: "",
      category_id: null,
    };
    return acc;
  }, {});

  function handleFileChange(
    event: any,
    language: LanguageEnum,
    type: "image" | "video"
  ) {
    const input = event.target;

    if (input.files && input.files.length > 0) {
      if (type === "image") {
        formData[language].image = input.files[0];
        formData[language].imageName = input.files[0].name;
        formData[language].video = null;
        formData[language].videoName = "";
      } else if (type === "video") {
        formData[language].video = input.files[0];
        formData[language].videoName = input.files[0].name;
        formData[language].image = null;
        formData[language].imageName = "";
      }
      formData[language].fileError = "";
    } else {
      if (type === "image") {
        formData[language].image = null;
        formData[language].imageName = "";
      } else if (type === "video") {
        formData[language].video = null;
        formData[language].videoName = "";
      }
    }
  }

  function getRandomString() {
    return uuidv4().split("-")[0];
  }
  async function uploadFile(file: File, language: LanguageEnum) {
    const fileExtension = file.name.split(".").pop();
    const randomPart = getRandomString();
    const fileName = `${language}_${randomPart}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from("news-files")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }

    return `news-files/${fileName}`;
  }

  onMount(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*,category_translations(*)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      categories = data;
    }
  });

  async function formSubmit() {
    let isValid = true;
    const uploads = [];
    isLoading = true;

    for (const language of languages) {
      if (!formData[language].image && !formData[language].video) {
        formData[language].fileError = "Either image or video is required";
        isValid = false;
      } else {
        const file = formData[language].image || formData[language].video;
        const uploadPromise = uploadFile(file, language);
        uploads.push(uploadPromise);
      }
    }

    if (!isValid) {
      isLoading = false;
      return;
    }

    if (!selectedCategoryIds) {
      alertMessage =
        "No news item selected. Please select a news item before submitting.";
      showAlert = true;
      isValid = false;
    }

    try {
      const filePaths = await Promise.all(uploads);
      const newsLanguageData = languages.map((language, index) => ({
        file: filePaths[index],
        language,
        created_at: new Date().toISOString(),
      }));

      const newsObject = {
        created_at: new Date().toISOString(),
      };

      await newsStore.insertNewsData(
        newsObject,
        newsLanguageData,
        selectedCategoryIds,
        selectedSubCategoryIds,
        supabase
      );

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/news");
      }, 3000);
    } catch (error) {
      console.error("Error during news insertion:", error);
    } finally {
      isLoading = false;
    }
  }
  function handleCategoryChange(event: any) {
    selectedCategoryIds = event.detail;
  }

  function handleSubCategoryChange(event: any) {
    selectedSubCategoryIds = event.detail;
  }
</script>

<div
  class="pt-5 lg:pt-10 flex flex-col justify-center items-center max-w-screen-lg mx-auto"
>
  <div class="w-full mb-5 flex space-x-4">
    <CategoryDropdown on:categoryChange={handleCategoryChange} />
    <SubCategoryDropdown on:categoryChange={handleSubCategoryChange} />
  </div>
  <div class="border rounded w-full">
    <LanguageTabs {languages} {formData} {handleFileChange} />
    <div class="flex justify-end p-4">
      <Button on:click={formSubmit}>Submit</Button>
    </div>
  </div>
  {#if isLoading}
    <FullPageLoadingIndicator />
  {/if}
</div>

{#if showToast}
  <Toast message="New news has been inserted successfully" type="success" />
{/if}
