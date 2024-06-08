<script lang="ts">
  import { onMount } from "svelte";
  import "../styles.css";
  import "../../app.css";
  import Layout from "$lib/components/Layout.svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import { goto } from "$app/navigation";
  import { authStore } from "../../stores/Auth.Store";

  let sidebarOpen: boolean = true;
  let isLoading: boolean = true;

  onMount(async () => {
    await CheckAuth();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    isLoading = false;
  });

  async function CheckAuth() {
    await authStore.getAuth();
    if (!$authStore) {
      return goto("/");
    }
  }
</script>

{#if isLoading}
  <LoadingIndicator />
{:else}
  <Layout {sidebarOpen}>
     <slot />
  </Layout>
{/if}
