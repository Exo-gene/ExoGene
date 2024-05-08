import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  NewsDataModel,
  NewsLanguageModel,
  NewsModel,
} from "../models/newsModel";

const createNewsStore = () => {
  const { subscribe, set, update } = writable<NewsModel[]>([]);

  return {
    subscribe,
    set: (news: NewsModel[]) => {
      set(news);
    },

    getSubCategoriesData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paged_subcategories", {
        page_size: pageSize,
        page_num: pageNum,
      });

      if (query.error) {
        console.error("Error fetching subcategories:", query.error);
        set([]);
      } else {
        set(query.data || []);
      }
    },
    deleteSubCategoryData: async (
      subcategoryId: number,
      supabase: SupabaseClient
    ) => {
      try {
        const { error } = await supabase.rpc(
          "delete_subcategories_and_subcategory_translations",
          {
            data: { id: subcategoryId },
          }
        );

        if (error) {
          console.error("Error deleting subcategory:", error);
          throw error;
        }

        update((currentCategories) =>
          currentCategories.filter(
            (subcategory) => subcategory.id !== subcategoryId
          )
        );
      } catch (error) {
        console.error("Failed to delete subcategory:", error);
        throw error;
      }
    },
    insertSubCategoryData: async (
      subcategoryObject: NewsDataModel,
      subcategoryLanguageData: NewsLanguageModel[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "insert_subcategories_and_subcategory_translations",
          {
            subcategory_data: subcategoryObject,
            subcategory_lang_data: subcategoryLanguageData,
          }
        );

        if (error) {
          console.error("Error inserting subcategory:", error);
          throw error;
        }

        update((currentSubCategories) => {
          return [...currentSubCategories, ...(data || [])];
        });

        return data;
      } catch (error) {
        console.error("Failed to insert subcategory:", error);
        throw error;
      }
    },
    updateSubCategoryData: async (
      subcategoryObject: NewsDataModel,
      subcategoryLanguageData: NewsLanguageModel[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "update_subcategories_and_subcategory_translations",
          {
            subcategory_data: subcategoryObject,
            subcategory_lang_data: subcategoryLanguageData,
          }
        );

        if (error) {
          console.error("Error updating subcategory:", error);
          throw error;
        }

        update((currentSubCategories) => {
          return currentSubCategories.map((subcategory) => {
            if (subcategory.id === subcategoryObject.id) {
              return data ? data[0] : subcategory;
            }
            return subcategory;
          });
        });

        return data;
      } catch (error) {
        console.error("Failed to update subcategory:", error);
        throw error;
      }
    },
  };
};

export const newsStore = createNewsStore();
