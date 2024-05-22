<script lang="ts">
  import type { ImageType } from "$lib/Models/Common/Image.Common.Model";
    import { Dropzone } from "flowbite-svelte";
  
    export let image: ImageType | undefined;
    let inputValue: string = "";
  
    function handleFileChange(event: Event) {
      const input = event.target as HTMLInputElement;
      if (!input.files || input.files.length === 0) {
        return;
      }
      const file = input.files[0];
      image!.url = file;
      image!.localUrl = URL.createObjectURL(file);
    }
  
    function handleInputChange(activeEvent: any) {
      inputValue = activeEvent?.target?.value;
    }
  </script>
  
  <div class="w-full h-60 flex justify-center items-center">
    <Dropzone
      class="w-96 h-60 p-4"
      id="dropzone"
      on:input={handleInputChange}
      on:change={handleFileChange}
    >
      {#if image?.localUrl}
        <img
          src={image?.localUrl}
          alt=""
          class="w-52 h-52 object-cover rounded-lg m-5"
        />
      {:else}
        <svg
          aria-hidden="true"
          class="mb-3 w-10 h-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          /></svg
        >
        <!-- <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p> -->
        <p class="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or jpeg</p>
      {/if}
    </Dropzone>
  </div>
  