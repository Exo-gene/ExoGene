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
    class="hover-button rounded px-2 py-2 text-sm font-medium disabled:opacity-50"
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
    class="hover-button rounded px-2 py-2 text-sm font-medium disabled:opacity-50"
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

<style>
  .hover-button {
    border: 1px solid var(--buttonBackgroundColor);
    background-color: var(--buttonBackgroundColor);
    color: var(--textColor);
    transition: background-color 0.3s ease;
  }
  .hover-button:hover {
    background-color: var(--textColor);
    color: rgba(var(--buttonBackgroundColor), 1) !important ;
  }
</style>
