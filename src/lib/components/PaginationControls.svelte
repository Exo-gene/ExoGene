<script>
  export let currentPage;
  export let totalPages;
  export let previousPage;
  export let nextPage;
</script>

<div class="pagination-controls flex justify-end items-center space-x-4 mt-4">
  <button
    on:click={previousPage}
    disabled={currentPage <= 1}
    class="px-2 py-2 text-sm font-medium text-gray-700 bg-white rounded hover:bg-gray-100 disabled:opacity-50"
  >
    <!-- Icon for previous button -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 19l-7-7 7-7"
      />
    </svg>
  </button>

  <span style="color:var(--titleColor)">
    <span>{currentPage}</span> of {totalPages} Pages</span
  >

  <button
    on:click={nextPage}
    disabled={currentPage >= totalPages}
    class="px-2 py-2 text-sm font-medium text-gray-700 bg-white rounded hover:bg-gray-100 disabled:opacity-50"
  >
    <!-- Icon for next button -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 5l7 7-7 7"
      />
    </svg>
  </button>
</div>
