<script lang="ts">
  import { Label, Select } from "flowbite-svelte";

  export let categories: any = [];
  export let handleCategoryChange: (event: any) => void;
  export let selectedCategoryId: number | null;

  const findEnglishTitle = (category: any) => {
    return (
      category.category_translations.find((t) => t.language === "en")?.title ||
      "No Title"
    );
  };
</script>

<div>
  <Label for="category-select">Select Category</Label>
  <Select
    id="category-select"
    bind:value={selectedCategoryId}
    on:change={handleCategoryChange}
  >
    {#each categories as category}
      <option value={category.id} selected={category.id === selectedCategoryId}>
        {findEnglishTitle(category)}
      </option>
    {/each}
  </Select>
</div>
