<script lang="ts">
  import { Label } from "flowbite-svelte";
  import type { CustomThemeModel } from "../../models/customThemeModel";

  export let theme: CustomThemeModel;
</script>

<div class="flex flex-col space-y-4">
  <div class="flex items-center space-x-4 border-b-2 py-4">
    <div class="flex flex-col items-center w-1/3">
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
    <div class="flex flex-col items-center w-1/3">
      <Label style="color:var(--textColor)" for="backgroundCard"
        >Background Card</Label
      >
      <input
        type="color"
        id="backgroundCard"
        bind:value={theme.backgroundCard}
        class="w-full h-12"
      />
      <span class="mt-2">{theme.backgroundCard}</span>
    </div>
    <div class="flex flex-col items-center w-1/3">
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
  {#each Array(7)
    .fill(0)
    .map((_, i) => i + 1) as section}
    <div class="flex items-center justify-between gap-4 py-4">
      <div class="flex flex-col w-1/3">
        <Label style="color:var(--textColor)" for={"section" + section}
          >Section {section}</Label
        >
        <span class="mt-2">{theme[`section${section}`]}</span>
      </div>
      <input
        type="color"
        id={"section" + section}
        bind:value={theme[`section${section}`]}
        class="w-2/3 h-12"
      />
    </div>
  {/each}
</div>
