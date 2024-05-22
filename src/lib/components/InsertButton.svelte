<script lang="ts">
  export let insertData: () => void;
</script>

<div class="py-5 px-4 lg:px-0 flex justify-end">
  <button
    style="background-color: var(--insertButtonBackgroundColor); color:var(--insertButtonColor)"
    on:click={insertData}
    class="flex items-center gap-2 p-2 rounded shadow-md border"
  >
    <svg
      width="20px"
      height="20px"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      style="fill: var(--insertButtonColor);"
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0" />
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <g id="SVGRepo_iconCarrier">
        <path
          d="M9 17a1 1 0 102 0v-6h6a1 1 0 100-2h-6V3a1 1 0 10-2 0v6H3a1 1 0 000 2h6v6z"
          fill-rule="evenodd"
        />
      </g>
    </svg>
    Add
  </button>
</div>

<style>
  button svg {
    fill: var(--insertButtonColor);
  }
</style>
