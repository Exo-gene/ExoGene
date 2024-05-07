<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { supabase } from "$lib/supabaseClient";
  import Toast from "$lib/components/Toast.svelte";
   // @ts-ignore
  import { v4 as uuidv4 } from "uuid";
  import { Tabs, TabItem, Label, Input, Button } from "flowbite-svelte";
  import type {
    AdvertisementDataModelToUpdate,
    AdvertisementLanguageModel,
  } from "../../../../models/advertisementModel";
  import { LanguageEnum } from "../../../../models/languageEnum";
  import { advertisementStore } from "../../../../stores/advertisementStore";

  let showToast = false;
  const id = +$page.params.advertisementId;
  const languages: LanguageEnum[] = Object.values(LanguageEnum);

  let advertisement: AdvertisementDataModelToUpdate = {
    id,
    start_date: new Date(),
    end_date: new Date(),
    advertisement_translations: [],
  };

  let formData: { [key: string]: any } = {};

  // Fetch data from db
  onMount(async () => {
    const { data, error } = await supabase.rpc("get_advertisement_by_id", {
      input_advertisement_id: id,
    });

    if (error) {
      console.error("Error fetching data:", error);
      showToast = true;
      return;
    }

    if (data && data.length > 0) {
      advertisement = {
        ...data[0],
        start_date: data[0].start_date.split("T")[0],

        end_date: data[0].end_date.split("T")[0],
      };
      advertisement.advertisement_translations.forEach(
        (trans: AdvertisementLanguageModel) => {
          formData[trans.language] = {
            image: trans.image,
            imageName: trans.image.split("/").pop(),
            imageError: "",
          };
        }
      );
    }
  });

  function handleFileChange(event: any, language: LanguageEnum) {
    const input = event.target;
    if (input.files && input.files.length > 0) {
      formData[language].image = input.files[0];
      formData[language].imageName = input.files[0].name;
      formData[language].imageError = "";
    } else {
      formData[language].image = null;
      formData[language].imageName = "";
      formData[language].imageError = "File not selected.";
    }
  }

  async function uploadFile(file: File, language: LanguageEnum) {
    const fileExtension = file.name.split(".").pop();
    const randomPart = uuidv4().split("-")[0];
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

    const createdAt = new Date();
    return {
      path: `advertisement-images/${fileName}`,
      createdAt: createdAt,
    };
  }

  async function formSubmit() {
    let isValid = true;
    const uploads = [];

    for (const language of languages) {
      if (formData[language].image instanceof File) {
        const uploadPromise = uploadFile(
          formData[language].image,
          language
        ).then(({ path, createdAt }) => {
          formData[language].image = path;
          return {
            language,
            image: path,
            created_at: createdAt,
          };
        });
        uploads.push(uploadPromise);
      } else {
        const existingCreatedAt =
          formData[language].created_at || new Date().toISOString();
        uploads.push(
          Promise.resolve({
            language,
            image: formData[language].image,
            created_at: existingCreatedAt,
          })
        );
      }
    }

    if (!isValid) return;

    try {
      // Wait for all file uploads to finish
      const advertisementLanguageData = await Promise.all(uploads);

      const advertisementObject = {
        id,
        start_date: advertisement.start_date,
        end_date: advertisement.end_date,
      };

      // Updating advertisement data in the store
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
      console.error("Error during advertisement update:", error);
    }
  }
</script>

<div class="pt-5 lg:pt-10 flex flex-col justify-center max-w-screen-lg mx-auto">
  <div class="w-full mb-5 flex space-x-4">
    <div>
      <Label for="start-date">Start Date</Label>
      <Input
        type="date"
        id="start-date"
        bind:value={advertisement.start_date}
      />
    </div>
    <div>
      <Label for="end-date">End Date</Label>
      <Input type="date" id="end-date" bind:value={advertisement.end_date} />
    </div>
  </div>
  <div class="border rounded w-full">
    <Tabs tabStyle="underline" defaultClass="bg-[#D0D0D0] flex">
      {#each languages as language}
        <TabItem title={language} open={language === LanguageEnum.EN}>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            <b>Enter data for {language}:</b>
            <div class="mb-6 flex justify-between items-start">
              <div>
                <Label for={`image-${language}`}>Image</Label>
                <Input
                  type="file"
                  id={`image-${language}`}
                  on:change={(event) => handleFileChange(event, language)}
                />
                {#if formData[language]?.imageName}
                  <span>Selected File: {formData[language].imageName}</span>
                {/if}
                {#if formData[language]?.imageError}
                  <p class="text-red-500">{formData[language].imageError}</p>
                {/if}
              </div>
              <div class="">
                {#if formData[language]?.imageName}
                  <img
                    src={`${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_URL}/${formData[language].image}`}
                    alt={`Image for ${language}`}
                    class="w-44 h-44 mt-2"
                  />
                {/if}
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
  <Toast message="Advertisement updated successfully" type="success" />
{/if}
