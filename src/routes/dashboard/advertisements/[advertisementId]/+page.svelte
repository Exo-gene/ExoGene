<script lang="ts">
  import CategoryDropdown from "$lib/components/CategoryDropdown.svelte";
  import LanguageTabs from "./../../../../lib/components/LanguageTabs.svelte";
  import PositionSelect from "./../../../../lib/components/PositionSelect.svelte";
  import { Button, Input, Label } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  // @ts-ignore
  import { v4 as uuidv4 } from "uuid";
  import FullPageLoadingIndicator from "$lib/components/FullPageLoadingIndicator.svelte";
  import { toLocaleDateFormat, toUtc } from "$lib/utils/dateTimeFormat.js";
  import { PositionEnum } from "../../../../models/positionEnum.js";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { advertisementStore } from "../../../../stores/advertisementStore";
  import { page } from "$app/stores";
  import type {
    AdvertisementLanguageModelToUpdate,
    FormDataSet,
  } from "../../../../models/advertisementModel";

  const id = +$page.params.advertisementId;
  let isLoading = false;
  let showToast = false;
  let selectedCategoryId: number;
  let start_date = "";
  let end_date = "";
  let positions = Object.values(PositionEnum);
  let languages = Object.values(LanguageEnum);
  let selectedPosition = PositionEnum.LEFT;

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

  onMount(async () => {
    isLoading = true;

    const { data: advertisementData, error: advertisementError } =
      await supabase.rpc("get_advertisement_by_id", {
        input_advertisement_id: id,
      });

    if (advertisementError) {
      console.error("Error fetching advertisement data:", advertisementError);
      showToast = true;
    } else if (advertisementData && advertisementData.length > 0) {
      const advertisement = advertisementData[0];

      // Convert UTC dates to local dates
      start_date = toLocaleDateFormat(advertisement.start_date);
      end_date = toLocaleDateFormat(advertisement.end_date);

      selectedPosition = advertisement.position;
      selectedCategoryId = advertisement.category_id;

      for (const translation of advertisement.advertisement_translations) {
        const fileParts = translation.file.split("/");
        const fileName = fileParts[fileParts.length - 1];
        const fileExtension = fileName.split(".").pop();

        if (["jpg", "png", "jpeg"].includes(fileExtension)) {
          formData[translation.language] = {
            ...formData[translation.language],
            image: `advertisement-files/${fileName}`,
            imageName: fileName,
          };
        } else if (["mp4", "avi"].includes(fileExtension)) {
          formData[translation.language] = {
            ...formData[translation.language],
            video: `advertisement-files/${fileName}`,
            videoName: fileName,
          };
        }
      }
    }

    isLoading = false;
  });

  function handleFileChange(
    event: any,
    language: LanguageEnum,
    type: "image" | "video"
  ) {
    const file = event.target.files[0];
    if (file) {
      const newData = { ...formData[language] };

      if (type === "image") {
        newData.image = file;
        newData.imageName = file.name;
        newData.video = null;
        newData.videoName = "";
      } else if (type === "video") {
        newData.video = file;
        newData.videoName = file.name;
        newData.image = null;
        newData.imageName = "";
      }

      newData.fileError = "";

      // Ensuring reactivity by updating formData with the new language-specific data
      formData = { ...formData, [language]: newData };
    }
  }

  function handleCategoryChange(event: any) {
    selectedCategoryId = event.detail;
  }

  function selectPosition(event: any) {
    selectedPosition = event.target.value;
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
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }

    return `advertisement-files/${fileName}`;
  }

  async function formSubmit() {
    isLoading = true;
    let isValid = true;
    const uploadPromises = [];

    // Prepare uploads for each language
    for (const language of languages) {
      const languageData = formData[language];

      if (!languageData.image && !languageData.video) {
        languageData.fileError = "Either image or video is required";
        isValid = false;
      } else {
        // Process image if it exists and is a File object
        if (languageData.image instanceof File) {
          uploadPromises.push(
            uploadFile(languageData.image, language).then((filePath) => {
              languageData.image = filePath;
              return filePath;
            })
          );
        }

        // Process video if it exists and is a File object
        if (languageData.video instanceof File) {
          uploadPromises.push(
            uploadFile(languageData.video, language).then((filePath) => {
              languageData.video = filePath;
              return filePath;
            })
          );
        }
      }
    }

    if (!isValid) {
      isLoading = false;
      return;
    }

    try {
      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
      const advertisementLanguageData: AdvertisementLanguageModelToUpdate[] =
        languages.map((language) => {
          const file = formData[language].image || formData[language].video;
          if (typeof file !== "string") {
            throw new Error("File is not uploaded properly: " + language);
          }
          return { file, language };
        });

      const advertisementObject = {
        id,
        start_date: toUtc(start_date),
        end_date: toUtc(end_date),
        position: selectedPosition,
        category_id: selectedCategoryId,
      };

      await advertisementStore.updateAdvertisementData(
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
</script>

{#if isLoading}
  <FullPageLoadingIndicator />
{:else}
  <div
    class="pt-5 lg:pt-10 flex flex-col justify-center max-w-screen-lg mx-auto"
  >
    <div class="w-full mb-5 flex space-x-4">
      <div class="mb-4">
        <Label for="start-date">Start Date</Label>
        <Input
          class="form-input px-4 py-2 rounded-md border-2 border-gray-300"
          type="datetime-local"
          id="start-date"
          bind:value={start_date}
        />
      </div>
      <div class="mb-4">
        <Label for="end-date">End Date</Label>
        <Input
          class="form-input px-4 py-2 rounded-md border-2 border-gray-300"
          type="datetime-local"
          id="end-date"
          bind:value={end_date}
        />
      </div>
      <PositionSelect {positions} bind:selectedPosition {selectPosition} />
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
