<script lang="ts">
  import { advertisementStore } from "../../../../stores/advertisementStore";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { Tabs, TabItem, Label, Input, Button, Select } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  // @ts-ignore
  import { v4 as uuidv4 } from "uuid";
  import { onMount } from "svelte";
  import type { CategoryLanguageModel } from "../../../../models/categoryModel";
  import { PositionEnum } from "../../../../models/positionEnum";

  let showToast = false;
  const languages: LanguageEnum[] = Object.values(LanguageEnum);
  let categories: CategoryDataModel[] = [];
  let selectedCategoryId: number = 0;
  let start_date: Date = new Date();
  let end_date: Date = new Date();
  let selectedPosition = PositionEnum.LEFT;
  const positions = Object.values(PositionEnum);

  interface CategoryDataModel {
    id: number;
    created_at: Date;
    deleted_at: Date;
    category_translations: CategoryLanguageModel[];
  }
  interface FormData {
    [key: string]: {
      image: File | null;
      video: File | null;
      imageName: string;
      videoName: string;
      fileError: string;
      category_id: number;
    };
  }

  let formData: FormData = languages.reduce((acc, language) => {
    acc[language] = {
      image: null,
      video: null,
      imageName: "",
      videoName: "",
      fileError: "",
      category_id: 0,
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
        // Clear video data
        formData[language].video = null;
        formData[language].videoName = "";
      } else if (type === "video") {
        formData[language].video = input.files[0];
        formData[language].videoName = input.files[0].name;
        // Clear image data
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
  //////categories ////////////////
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

  function selectPosition(position: any) {
    selectedPosition = position;
  }

  ///////////
  async function formSubmit() {
    let isValid = true;
    const uploads = [];

    for (const language of languages) {
      if (!formData[language].image && !formData[language].video) {
        formData[language].fileError = "Either image or video is required";
        isValid = false;
      } else {
        const file = formData[language].image || formData[language].video;
        const uploadPromise = uploadFile(file!, language);
        uploads.push(uploadPromise);
      }
    }

    if (!isValid) return;

    try {
      const filePaths = await Promise.all(uploads);

      const advertisementLanguageData = languages.map((language, index) => ({
        file: filePaths[index],
        language,
        created_at: new Date(),
      }));

      const advertisementObject = {
        start_date,
        end_date,
        position: selectedPosition,
        category_id: selectedCategoryId,
        created_at: new Date(),
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
    }
  }
</script>

<div class="pt-5 lg:pt-10 flex flex-col justify-center max-w-screen-lg mx-auto">
  <div class="w-full mb-5 flex space-x-4">
    <div>
      <Label for="start-date">Start Date</Label>
      <Input type="date" id="start-date" bind:value={start_date} />
    </div>
    <div>
      <Label for="end-date">End Date</Label>
      <Input type="date" id="end-date" bind:value={end_date} />
    </div>
    <div>
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
    <div>
      <Label for="category-select">Select Position</Label>
      <Select id="category-select" on:change={handleCategoryChange}>
        {#each positions as position}
          <option on:click={() => selectPosition(position)}>
            {position}
          </option>
        {/each}
      </Select>
    </div>
  </div>
  <div class="border rounded w-full">
    <Tabs tabStyle="underline" defaultClass="bg-[#D0D0D0] flex">
      {#each languages as language}
        <TabItem title={language} open={language === LanguageEnum.EN}>
          <p class="text-red-600 mb-2">
            Note: Only one file (image or video) can be entered for each
            language.
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
                    on:change={(event) =>
                      handleFileChange(event, language, "image")}
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
                    on:change={(event) =>
                      handleFileChange(event, language, "video")}
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
    <div class="flex justify-end p-4">
      <Button on:click={formSubmit}>Submit</Button>
    </div>
  </div>
</div>

{#if showToast}
  <Toast
    message="New advertisement has been inserted successfully"
    type="success"
  />
{/if}
