<script lang="ts">
  import { goto } from "$app/navigation";

  // Navigation functions
  function redirectToPage(page: string) {
    goto(`/dashboard/${page}`);
  }
</script>

<div class="max-w-screen-2xl mx-auto">
  <div class="grid grid-cols-4 gap-4">
    <div class="grid-cols-1 flex justify-center">
      <button
        style="background-color: var(--primary-background);color:var(--primary-textColor)"
        class="w-full rounded"
        on:click={() => redirectToPage("patient")}>Patient</button
      >
    </div>
    <div class="grid-cols-1 flex justify-center">
      <button
        style="background-color: var(--primary-background);color:var(--primary-textColor)"
        class="w-full rounded"
        on:click={() => redirectToPage("test")}>Test</button
      >
    </div>
    <div class="grid-cols-1 flex justify-center">
      <button
        style="background-color: var(--primary-background);color:var(--primary-textColor)"
        class="w-full rounded"
        on:click={() => redirectToPage("user")}>User</button
      >
    </div>
    <div class="grid-cols-1 flex justify-center">
      <button
        style="background-color: var(--primary-background);color:var(--primary-textColor)"
        class="w-full rounded"
        on:click={() => redirectToPage("status")}>Status</button
      >
    </div>
    <div class="grid-cols-1 flex justify-center">
      <button
        style="background-color: var(--primary-background);color:var(--primary-textColor)"
        class="w-full rounded"
        on:click={() => redirectToPage("sample-type")}>Sample Type</button
      >
    </div>
    <div class="grid-cols-1 flex justify-center">
      <button
        style="background-color: var(--primary-background);color:var(--primary-textColor)"
        class="w-full rounded"
        on:click={() => redirectToPage("company")}>Company</button
      >
    </div>
    <div class="grid-cols-1 flex justify-center">
      <button
        style="background-color: var(--primary-background);color:var(--primary-textColor)"
        class="w-full rounded"
        on:click={() => redirectToPage("doctor")}>Doctor</button
      >
    </div>
    <div class="grid-cols-1 flex justify-center">
      <button
        style="background-color: var(--primary-background);color:var(--primary-textColor)"
        class="w-full rounded"
        on:click={() => redirectToPage("lab")}>Lab</button
      >
    </div>
    <div class="grid-cols-1 flex justify-center">
      <button
        style="background-color: var(--primary-background);color:var(--primary-textColor)"
        class="w-full rounded"
        on:click={() => redirectToPage("store")}>Store</button
      >
    </div>
    <div class="grid-cols-1 flex justify-center">
      <button
        style="background-color: var(--primary-background);color:var(--primary-textColor)"
        class="w-full rounded"
        on:click={() => redirectToPage("accountant")}>Accountant</button
      >
    </div>
    <div class="grid-cols-1 flex justify-center">
      <button
        style="background-color: var(--primary-background);color:var(--primary-textColor)"
        class="w-full rounded"
        on:click={() => redirectToPage("sticker")}>Sticker</button
      >
    </div>
    <div class="grid-cols-1 flex justify-center">
      <button
        style="background-color: var(--primary-background);color:var(--primary-textColor)"
        class="w-full rounded"
        on:click={() => redirectToPage("role")}>Role</button
      >
    </div>
    <div class="grid-cols-1 flex justify-center">
      <button
        style="background-color: var(--primary-background);color:var(--primary-textColor)"
        class="w-full rounded"
        on:click={() => redirectToPage("statistic")}>Statistic</button
      >
    </div>
    <div class="grid-cols-1 flex justify-center">
      <button
        style="background-color: var(--primary-background);color:var(--primary-textColor)"
        class="w-full rounded"
        on:click={() => redirectToPage("report")}>Report</button
      >
    </div>
    <div class="grid-cols-1 flex justify-center">
      <button
        style="background-color: var(--primary-background);color:var(--primary-textColor)"
        class="w-full rounded"
        on:click={() => redirectToPage("system-theme")}>System Theme</button
      >
    </div>
  </div>
</div>
