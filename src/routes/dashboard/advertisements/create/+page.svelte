 <script lang="ts">
	import { advertisementStore } from './../../../../stores/advertisementStore.ts';
	import LanguageTabs from './../../../../lib/components/LanguageTabs.svelte';
	import PositionSelect from './../../../../lib/components/PositionSelect.svelte';
	import CategorySelect from './../../../../lib/components/CategorySelect.svelte';
	import DateInput from './../../../../lib/components/DateInput.svelte';
	import { LanguageEnum } from './../../../../models/languageEnum.ts';
	import { PositionEnum } from './../../../../models/positionEnum.ts';
  import { Button } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
   import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
     // @ts-ignore
  import { v4 as uuidv4 } from "uuid";
  import LoadingIndicator from '$lib/components/LoadingIndicator.svelte';
  import FullPageLoadingIndicator from '$lib/components/FullPageLoadingIndicator.svelte';
  import { toUtc } from '$lib/components/dateTimeFormat.js';


 let isLoading = false;
  let categories:any = [];
  let positions = Object.values(PositionEnum);
  let languages = Object.values(LanguageEnum);
  let selectedCategoryId :number|null = null;
  let start_date = new Date();
  let end_date = new Date();
  let selectedPosition = PositionEnum.LEFT;
  let showToast = false;


  let formData:any = languages.reduce((acc, language) => {
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

  function handleCategoryChange(event:any) {
    const value = parseInt(event.target.value);
    selectedCategoryId = value;
    Object.keys(formData).forEach((language) => {
      formData[language].category_id = value;
    });
  }

  function selectPosition(event:any) {
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
        const uploadPromise = uploadFile(file!, language);
        uploads.push(uploadPromise);
      }
    }

    if (!isValid){
        isLoading = false;
        return};

    try {
      const filePaths = await Promise.all(uploads);
      const advertisementLanguageData = languages.map((language, index) => ({
        file: filePaths[index],
        language,
        created_at: new Date().toISOString(),
      }));

      const advertisementObject = {
       start_date:toUtc(start_date) ,
        end_date: toUtc(end_date),
        position: selectedPosition,
        category_id: selectedCategoryId,
        created_at: new Date().toISOString(),
      };

      // Passing the structured data to the store
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
        isLoading = false;
    } catch (error) {
      console.error("Error during advertisement insertion:", error);
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
  
</script>
 
<div class="pt-5 lg:pt-10 flex flex-col justify-center max-w-screen-lg mx-auto">
  <div class="w-full mb-5 flex space-x-4">
    <DateInput id="start-date" label="Start Date" bind_value={start_date} />
    <DateInput id="end-date" label="End Date" bind_value={end_date} />
    <CategorySelect {categories} {handleCategoryChange} {selectedCategoryId} />
    <PositionSelect {positions} {selectPosition} {selectedPosition} />
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
  <Toast
    message="New advertisement has been inserted successfully"
    type="success"
  />
{/if}

 
