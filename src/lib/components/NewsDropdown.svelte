<script lang="ts">
  import { onMount } from "svelte";
  import { Button, Dropdown, DropdownItem, Search } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import type { NewsDataModel } from "../../models/newsModel";

  export let selectedNewsId: number;
  export let onNewsChange: (newsId: number) => void;

  let searchTerm = "";
  let newsItems: NewsDataModel[] = [];
  let lastFilter: string | undefined = "";

  async function fetchNews(titleFilter?: string) {
    // Only fetch if the filter has actually changed to avoid duplicate requests
    if (titleFilter === lastFilter) return;
    lastFilter = titleFilter;

    const params = {
      page_num: 1,
      page_size: 3,
      filter_title: titleFilter || undefined,
    };

    const query = await supabase.rpc("get_paged_news_filter", params);
    if (query.error) {
      console.error("Fetch news error:", query.error);
      return;
    }
    newsItems = query.data.items || [];
  }

  onMount(() => {
    fetchNews(); // Initial fetch without any filter
  });

  $: if (searchTerm.trim()) {
    fetchNews(searchTerm);
  } else if (searchTerm === "") {
    fetchNews(); // Explicitly handle empty search term to reset the filter
  }

  function handleSelection(item: NewsDataModel, event: MouseEvent) {
    event.stopPropagation();
    selectedNewsId = item.id;
    searchTerm = item.title; // Display the selected item's title in the search input
    onNewsChange(item.id);
  }

  function isSelected(id: number): boolean {
    return selectedNewsId === id;
  }
</script>

<div class="my-2">
  <Button>Select News</Button>
  <Dropdown class="w-full">
    <div slot="header" class="p-3">
      <Search
        size="md"
        bind:value={searchTerm}
        placeholder="Search news by title..."
        debounce={300}
      />
    </div>
    {#if newsItems.length === 0}
      <DropdownItem>No news found.</DropdownItem>
    {/if}
    {#each newsItems as item}
      <DropdownItem
        class="flex items-center justify-between"
        on:click={(event) => handleSelection(item, event)}
      >
        {item.title}
        {isSelected(item.id) ? " (Selected)" : ""}
      </DropdownItem>
    {/each}
  </Dropdown>
</div>
