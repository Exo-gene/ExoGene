<script lang="ts">
  import { advertisementStore } from "../../../../stores/advertisementStore";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { Tabs, TabItem, Label, Input, Button } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import Toast from "$lib/components/Toast.svelte";
  import { v4 as uuidv4 } from "uuid";

  let showToast = false;
  const languages: LanguageEnum[] = Object.values(LanguageEnum);

  let start_date: Date = new Date();
  let end_date: Date = new Date();

  interface FormData {
    [key: string]: {
      image: File | null;
      imageName: string;
      imageError: string;
    };
  }

  let formData: FormData = languages.reduce(
    (acc: FormData, language: LanguageEnum) => {
      acc[language] = {
        image: null,
        imageName: "",
        imageError: "",
      };
      return acc;
    },
    {}
  );

  function handleFileChange(event: any, language: LanguageEnum) {
    const input = event.target;
    console.log(input.files);

    if (input.files && input.files.length > 0) {
      formData[language].image = input.files[0];
      formData[language].imageName = input.files[0].name;
      formData[language].imageError = "";
    } else {
      formData[language].image = null;
      formData[language].imageName = "";
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
      .from("advertisement-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error);
      throw error;
    }

    // Return the full path where the file was uploaded
    return `advertisement-images/${fileName}`;
  }

  async function formSubmit() {
    let isValid = true;
    const uploads = [];

    for (const language of languages) {
      if (!formData[language].image) {
        formData[language].imageError = "Image is required";
        isValid = false;
      } else {
        // Prepare the upload promise
        const uploadPromise = uploadFile(formData[language].image!, language);
        uploads.push(uploadPromise);
      }
    }

    if (!isValid) return;

    try {
      // Wait for all file uploads to finish
      const imagePaths = await Promise.all(uploads);

      const advertisementLanguageData = languages.map((language, index) => ({
        image: imagePaths[index],
        language,
        created_at: new Date(),
      }));

      const advertisementObject = {
        start_date: start_date,
        end_date: end_date,
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
  </div>
  <div class="border rounded w-full">
    <Tabs tabStyle="underline" defaultClass="bg-[#D0D0D0] flex">
      {#each languages as language}
        <TabItem title={language} open={language === LanguageEnum.EN}>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            <b>Enter data for {language}:</b>
            <div class="mb-6 flex justify-between items-start">
              <div class="mb-6">
                <Label for={`image-${language}`}>Image</Label>
                <Input
                  type="file"
                  id={`image-${language}`}
                  on:change={(event) => handleFileChange(event, language)}
                />
                {#if formData[language].imageName}
                  <span>Selected File: {formData[language].imageName}</span>
                {/if}

                {#if formData[language].imageError}
                  <p class="text-red-500">{formData[language].imageError}</p>
                {/if}
              </div>
              <div class="">
                <!-- {#if formData[language]?.imageName}
                  <img
                    src={`${formData[language].image}`}
                    alt={`Image for ${language}`}
                    class="w-44 h-44 mt-2"
                  />
                {/if} -->
              </div>
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
