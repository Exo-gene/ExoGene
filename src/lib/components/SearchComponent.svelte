<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Search } from 'flowbite-svelte';

  const dispatch = createEventDispatcher();
  let searchTerm = "";

  function handleInput() {
    dispatch('search', searchTerm);
  }
</script>

<Search
  size="md"
  bind:value={searchTerm}
  placeholder="Search by name..."
  debounce={300}
  on:input={handleInput}
/>
