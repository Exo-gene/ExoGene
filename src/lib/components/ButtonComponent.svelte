<script lang="ts">
  export let dispatch: () => void;
  export let title: string;
</script>

<div class="py-5 px-4 lg:px-0 flex justify-end">
  <button
    on:click={dispatch}
    class="btn flex items-center gap-2 p-2 rounded shadow"
  >
    {title}
  </button>
</div>

<style>
  .btn {
    background-color: var(--backButtonBackgroundColor);
    color: var(--titleColor);
  }
</style>
