import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AboutDataModel, 
  AboutLanguageModelToUpdate,
  AboutModel,
} from "../models/aboutModel";

const createAboutStore = () => {
  const { subscribe, set, update } = writable<AboutModel[]>([]);

  return {
    subscribe,
    set: (about: AboutModel[]) => {
      set(about);
    },
    updateAboutData: async (
      aboutObject: AboutDataModel,
      aboutLanguageData: AboutLanguageModelToUpdate[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "update_about_and_about_translations",
          {
            about_data: aboutObject,
            about_lang_data: aboutLanguageData,
          }
        );

        if (error) {
          console.error("Error updating about:", error);
          throw error;
        }

        update((currentAbout) => {
          return currentAbout.map((about) => {
            if (about.id === aboutObject.id) {
              return data ? data[0] : about;
            }
            return about;
          });
        });

        return data;
      } catch (error) {
        console.error("Failed to update about:", error);
        throw error;
      }
    },
  };
};

export const aboutStore = createAboutStore();
