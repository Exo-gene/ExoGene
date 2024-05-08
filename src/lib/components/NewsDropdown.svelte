<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { Button, Dropdown, DropdownItem, Search } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";
  import type { NewsDataModel } from "../../models/newsModel";

  export let selectedNewsId: number;

  const dispatch = createEventDispatcher();

  let searchTerm = "";
  let newsItems: NewsDataModel[] = [];
  let lastFilter: string | undefined = "";

  async function fetchNews(titleFilter?: string) {
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
    searchTerm = item.title;

    // Using event dispatcher instead of direct call
    dispatch('newsChange', item.id);
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
