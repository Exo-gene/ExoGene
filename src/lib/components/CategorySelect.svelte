<script lang="ts">
  import { Label, Select } from "flowbite-svelte";

  export let categories :any= [];
  export let handleCategoryChange;

  // You might want to pass the selected category ID as a prop if needed
  export let selectedCategoryId;
</script>

<div>
  <Label for="category-select">Select Category</Label>
  <Select id="category-select" on:change={handleCategoryChange}>
    {#each categories as category}
      {#if category.category_translations.find((t) => t.language === "en")?.title}
        <option value={category.id} selected={category.id === selectedCategoryId}>
          {category.category_translations.find((t) => t.language === "en")?.title}
        </option>
      {/if}
    {/each}
  </Select>
</div>
