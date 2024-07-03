<script lang="ts">
  import { Label } from "flowbite-svelte";
  import type { CustomThemeModel } from "../../models/customThemeModel";

  export let theme: CustomThemeModel;
</script>

<div class="flex flex-col space-y-4">
  <div class="flex items-center space-x-4 py-4">
    <div class="flex flex-col items-center w-full">
      <Label style="color:var(--textColor)" for="mainBackgroundColor"
        >Main Background</Label
      >
      <input
        type="color"
        id="mainBackgroundColor"
        bind:value={theme.mainBackgroundColor}
        class="w-full h-12"
      />
      <span class="mt-2">{theme.mainBackgroundColor}</span>
    </div>
    <div class="flex flex-col items-center w-full">
      <Label style="color:var(--textColor)" for="backgroundButtonColor"
        >backgroundButtonColor</Label
      >
      <input
        type="color"
        id="backgroundButtonColor"
        bind:value={theme.backgroundButtonColor}
        class="w-full h-12"
      />
      <span class="mt-2">{theme.backgroundButtonColor}</span>
    </div>
    <div class="flex flex-col items-center w-full">
      <Label style="color:var(--textColor)" for="textColor">Text Color</Label>
      <input
        type="color"
        id="textColor"
        bind:value={theme.textColor}
        class="w-full h-12"
      />
      <span class="mt-2">{theme.textColor}</span>
    </div>
  </div>
</div>
