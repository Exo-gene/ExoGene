import { writable } from "svelte/store";
import { supabase } from "$lib/supabaseClient";

const createThemeStore = () => {
  const { subscribe, set } = writable<any>({ light: {}, dark: {} });

  return {
    subscribe,
    fetchThemeData: async () => {
      try {
        const lightThemeResponse = await supabase
          .from("customTheme")
          .select("*")
          .eq("theme", "light");

        const darkThemeResponse = await supabase
          .from("customTheme")
          .select("*")
          .eq("theme", "dark");

        const lightThemeData = lightThemeResponse.data?.[0] || {};
        const darkThemeData = darkThemeResponse.data?.[0] || {};

        set({ light: lightThemeData, dark: darkThemeData });
      } catch (error) {
        console.error("Unexpected error fetching theme data:", error);
      }
    },
  };
};

export const themeStore = createThemeStore();
