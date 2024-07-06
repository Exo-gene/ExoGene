<script lang="ts">
  import { onMount } from "svelte";
  import "../styles.css";
  import "../../app.css";
  import Layout from "$lib/components/Layout.svelte";
  import LoadingIndicator from "$lib/components/LoadingIndicator.svelte";
  import { goto } from "$app/navigation";
  import { authStore } from "../../stores/Auth.Store";
  import { themeStore } from "../../stores/themeStore";

  let isLoading: boolean = true;
  let theme = "light";
  let themeData = { light: {}, dark: {} };

  onMount(async () => {
    await CheckAuth();
    await loadThemeData();
    isLoading = false;
  });

  async function CheckAuth() {
    await authStore.getAuth();
    if (!$authStore) {
      return goto("/");
    }
  }

  async function loadThemeData() {
    theme = localStorage.getItem("theme") || "light";
    await themeStore.fetchThemeData();
    themeStore.subscribe((data) => {
      themeData = data;
      applyTheme(data[theme]);
    });
  }

  function applyTheme(themeVariables:any) {
    for (const [key, value] of Object.entries(themeVariables)) {
      document.documentElement.style.setProperty(`--${key}`, value);
    }
  }
</script>

{#if isLoading}
  <LoadingIndicator />
{:else}
  <Layout>
    <slot />
  </Layout>
{/if}
