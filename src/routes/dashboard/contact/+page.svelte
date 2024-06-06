<script lang="ts">
  import { Tabs, TabItem, Label, Input, Button } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import { onMount } from "svelte";
  import Toast from "$lib/components/Toast.svelte";
  import FullPageLoadingIndicator from "$lib/components/FullPageLoadingIndicator.svelte";
  import type {
    ContactLanguageModel,
    FormDataSet,
  } from "../../../models/contactModel";
  import { contactStore } from "../../../stores/contactStore";
  import { LanguageEnum } from "../../../models/languageEnum";

  const id = 1;
  let showToast = false;
  let isLoading = false;
  const languages: LanguageEnum[] = Object.values(LanguageEnum);

  // fetch data from db
  onMount(async () => {
    isLoading = true;
    let query = await supabase.rpc("get_contact_by_id", {
      input_contact_id: id,
    });
    isLoading = false;
    if (query && query.data) {
      const contactTranslations = query.data[0].contact_translations;

      languages.forEach((language) => {
        const translation = contactTranslations.find(
          (t: ContactLanguageModel) => t.language === language
        );
        if (translation) {
          formData[language].location = translation.location;
          formData[language].email = translation.email;
          formData[language].phoneNumber1 = translation.phoneNumber1;
          formData[language].phoneNumber2 = translation.phoneNumber2;
        }
      });
    }
  });

  let formData: FormDataSet = languages.reduce(
    (acc: FormDataSet, language: LanguageEnum) => {
      acc[language] = {
        location: "",
        locationError: "",
        email: "",
        emailError: "",
        phoneNumber1: "",
        phoneNumber1Error: "",
        phoneNumber2: "",
        phoneNumber2Error: "",
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
      if (!formData[language].location) {
        formData[language].locationError = "Location is required";
        isValid = false;
      }
      if (!formData[language].email) {
        formData[language].emailError = "Email is required";
        isValid = false;
      }
      if (!formData[language].phoneNumber1) {
        formData[language].phoneNumber1Error = "Phone number 1 is required";
        isValid = false;
      }
      if (!formData[language].phoneNumber2) {
        formData[language].phoneNumber2Error = "Phone number 2 is required";
        isValid = false;
      }
    });

    if (!isValid) {
      isLoading = false;
      return;
    }

    try {
      const contactLanguageData = languages.map((language, index) => ({
        location: formData[language].location as string,
        email: formData[language].email as string,
        phoneNumber1: formData[language].phoneNumber1 as string,
        phoneNumber2: formData[language].phoneNumber2 as string,
        language,
      }));
      const aboutObject = { id };

      await contactStore.updateContactData(
        aboutObject,
        contactLanguageData,
        supabase
      );

      showToast = true;
      setTimeout(() => {
        showToast = false;
      }, 1000);
    } catch (error) {
      console.error("Error during about insertion:", error);
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
              <b style="color:var(--titleColor)">Enter data for {language}:</b>
              <div class="my-4">
                <Label
                  class="mb-2"
                  style="color:var(--titleColor)"
                  for={`location-${language}`}>Location</Label
                >
                <div class:error={formData[language].locationError}>
                  <Input
                    id={`location-${language}`}
                    bind:value={formData[language].location}
                    placeholder="Enter location"
                    on:input={() => {
                      formData[language].locationError = "";
                    }}
                  />
                </div>
                {#if formData[language].locationError}
                  <p class="text-red-500">
                    {formData[language].locationError}
                  </p>
                {/if}
              </div>

              <div class="mb-6">
                <Label
                  class="mb-2"
                  style="color:var(--titleColor)"
                  for={`email-${language}`}>Email</Label
                >
                <div class:error={formData[language].emailError}>
                  <Input
                    id={`email-${language}`}
                    bind:value={formData[language].email}
                    placeholder="Enter email"
                    on:input={() => {
                      formData[language].emailError = "";
                    }}
                  />
                </div>
                {#if formData[language].emailError}
                  <p class="text-red-500">
                    {formData[language].emailError}
                  </p>
                {/if}
              </div>

              <div class="mb-6">
                <Label
                  class="mb-2"
                  style="color:var(--titleColor)"
                  for={`phoneNumber1-${language}`}>Phone Number 1</Label
                >
                <div class:error={formData[language].phoneNumber1Error}>
                  <Input
                    id={`phoneNumber1-${language}`}
                    bind:value={formData[language].phoneNumber1}
                    placeholder="Enter phone number 1"
                    on:input={() => {
                      formData[language].phoneNumber1Error = "";
                    }}
                  />
                </div>
                {#if formData[language].phoneNumber1Error}
                  <p class="text-red-500">
                    {formData[language].phoneNumber1Error}
                  </p>
                {/if}
              </div>

              <div class="mb-6">
                <Label
                  class="mb-2"
                  style="color:var(--titleColor)"
                  for={`phoneNumber2-${language}`}>Phone Number 2</Label
                >
                <div class:error={formData[language].phoneNumber2Error}>
                  <Input
                    id={`phoneNumber2-${language}`}
                    bind:value={formData[language].phoneNumber2}
                    placeholder="Enter phone number 2"
                    on:input={() => {
                      formData[language].phoneNumber2Error = "";
                    }}
                  />
                </div>
                {#if formData[language].phoneNumber2Error}
                  <p class="text-red-500">
                    {formData[language].phoneNumber2Error}
                  </p>
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
  <Toast message="This about has been updated successfully" type="success" />
{/if}
