<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import {
    Button,
    Dropdown,
    DropdownItem,
    Search,
    Checkbox,
  } from "flowbite-svelte";
  import { supabase } from "$lib/supabaseClient";

  export let selectedTagIds: number[] = [];
  const dispatch = createEventDispatcher();
  let searchTerm = "";
  let tagItems: any[] = [];
  let lastFilter: string | undefined = "";

  async function fetchTag(titleFilter?: string) {
    if (titleFilter === lastFilter) return;
    lastFilter = titleFilter;

    const params = {
      page_num: 1,
      page_size: 3,
      filter_title: titleFilter || undefined,
    };

    const query = await supabase.rpc("get_paged_tags_filter", params);
    if (query.error) {
      console.error("Fetch tag error:", query.error);
      return;
    }
    tagItems = query.data.items || [];
  }

  onMount(() => {
    fetchTag();
  });

  $: if (searchTerm.trim()) {
    fetchTag(searchTerm);
  } else if (searchTerm === "") {
    // Avoid clearing fetched tags if search is cleared but keep selected tag
    fetchTag();
  }

  function handleSelection(item: any, event: MouseEvent) {
    event.stopPropagation();

    const isSelected = selectedTagIds.includes(item.id);

    if (isSelected) {
      selectedTagIds = selectedTagIds.filter((id) => id !== item.id);
    } else {
      selectedTagIds = [...selectedTagIds, item.id];
    }
    dispatch("tagChange", selectedTagIds);
  }

  function isSelected(id: number): boolean {
    return selectedTagIds.includes(id);
  }
</script>

<div class="my-2">
  <Button>Select Tags</Button>
  <Dropdown class="w-full">
    <div slot="header" class="p-3">
      <Search
        size="md"
        bind:value={searchTerm}
        placeholder="Search Tags by title..."
        debounce={300}
      />
    </div>
    {#if tagItems.length === 0}
      <DropdownItem>No Tag found.</DropdownItem>
    {/if}
    {#each tagItems as item}
      <DropdownItem class="flex items-center justify-between">
        <div class="flex items-center">
          <Checkbox
            checked={isSelected(item.id)}
            on:change={(event) => handleSelection(item, event)}
          />
          <span class="ml-2">{item.title}</span>
        </div>
      </DropdownItem>
    {/each}
  </Dropdown>
</div>
