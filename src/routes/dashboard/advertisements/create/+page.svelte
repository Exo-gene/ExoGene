<script lang="ts">
  import LanguageTabs from "./../../../../lib/components/LanguageTabs.svelte";
  import PositionSelect from "./../../../../lib/components/PositionSelect.svelte";
  import { Button, Input, Label } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  // @ts-ignore
  import { v4 as uuidv4 } from "uuid";
  import FullPageLoadingIndicator from "$lib/components/FullPageLoadingIndicator.svelte";
  import { toUtc } from "$lib/utils/dateTimeFormat.js";
  import { PositionEnum } from "../../../../models/positionEnum.js";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { advertisementStore } from "../../../../stores/advertisementStore";
  import type { FormDataSet } from "../../../../models/advertisementModel";
  import CategoryDropdown from "$lib/components/CategoryDropdown.svelte";

  let isLoading = false;
  let positions = Object.values(PositionEnum);
  let languages = Object.values(LanguageEnum);
  let selectedCategoryId: number;
  let start_date = "";
  let end_date = "";

  let selectedPosition = PositionEnum.LEFT;
  let showToast = false;

  let formData: FormDataSet = languages.reduce(
    (acc: FormDataSet, language: LanguageEnum) => {
      acc[language] = {
        image: null,
        video: null,
        imageName: "",
        videoName: "",
        fileError: "",
        category_id: null,
      };
      return acc;
    },
    {}
  );

  function handleFileChange(
    event: Event,
    language: LanguageEnum,
    type: "image" | "video"
  ) {
    const input = event.target as HTMLInputElement;
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

  function handleCategoryChange(event: any) {
    selectedCategoryId = event.detail;
  }

  function selectPosition(event: any) {
    selectedPosition = event.target.value;
  }

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

    try {
      const filePaths = await Promise.all(uploads);
      const advertisementLanguageData = languages.map((language, index) => ({
        file: filePaths[index],
        language,
      }));

      const advertisementObject = {
        start_date: toUtc(start_date),
        end_date: toUtc(end_date),
        position: selectedPosition,
        category_id: selectedCategoryId,
      };

      await advertisementStore.insertAdvertisementData(
        advertisementObject,
        advertisementLanguageData,
        supabase
      );

      showToast = true;
      setTimeout(() => {
        showToast = false;
        goto("/dashboard/advertisements");
      }, 3000);
    } catch (error) {
      console.error("Error during advertisement insertion:", error);
    } finally {
      isLoading = false;
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
      .from("advertisement-files")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }

    return `advertisement-files/${fileName}`;
  }
</script>

{#if isLoading}
  <FullPageLoadingIndicator />
{:else}
  <div
    class="pt-5 lg:pt-10 flex flex-col justify-center items-center max-w-screen-lg mx-auto"
  >
    <div class="w-full mb-5 flex space-x-4">
      <div class="mb-4">
        <Label for="start-date">Start Date</Label>
        <Input 
          class="form-input px-4 py-2 rounded-md border-2 border-gray-300"
          type="date"
          id="start-date"
          bind:value={start_date}
        />
      </div>

      <div class="mb-4">
        <Label for="end-date">End Date</Label>
        <Input
          class="form-input px-4 py-2 rounded-md border-2 border-gray-300"
          type="date"
          id="end-date"
          bind:value={end_date}
        />
      </div>
      <PositionSelect {positions} {selectPosition} {selectedPosition} />
      <div class="mt-3">
        <CategoryDropdown
          {selectedCategoryId}
          on:categoryChange={handleCategoryChange}
        />
      </div>
    </div>
    <div class="w-full">
      <LanguageTabs {languages} {formData} {handleFileChange} />
      <div class="flex justify-end p-4">
        <Button on:click={formSubmit}>Submit</Button>
      </div>
    </div>
    {#if isLoading}
      <FullPageLoadingIndicator />
    {/if}
  </div>
{/if}
{#if showToast}
  <Toast
    message="New advertisement has been inserted successfully"
    type="success"
  />
{/if}
