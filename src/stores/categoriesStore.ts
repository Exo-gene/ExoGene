import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CategoryDataModel,
  CategoryLanguageModel,
  CategoryModel,
} from "../models/categoryModel";

const createCategoriesStore = () => {
  const { subscribe, set, update } = writable<CategoryModel[]>([]);

  return {
    subscribe,
    set: (categories: CategoryModel[]) => {
      set(categories);
    },
    getCategoriesData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paged_categories", {
        page_size: pageSize,
        page_num: pageNum,
      });

      if (query.error) {
        console.error("Error fetching categories:", query.error);
        set([]);
      } else {
        console.log("Categories fetched:", query.data);
        set(query.data || []);
      }
    },
    deleteCategoryData: async (
      categoryId: number,
      supabase: SupabaseClient
    ) => {
      try {
        const { error } = await supabase.rpc(
          "delete_categories_and_category_translations",
          {
            data: { id: categoryId },
          }
        );

        if (error) {
          console.error("Error deleting category:", error);
          throw error;
        }

        update((currentCategories) =>
          currentCategories.filter((category) => category.id !== categoryId)
        );
      } catch (error) {
        console.error("Failed to delete category:", error);
        throw error;
      }
    },
    insertCategoryData: async (
      categoryObject: CategoryDataModel,
      categoryLanguageData: CategoryLanguageModel[],
      supabase: SupabaseClient
    ) => {
      try {
        console.log("categoryObject", categoryObject);
        console.log("categoryLanguageData", categoryLanguageData);

        const { data, error } = await supabase.rpc(
          "insert_categories_and_category_translations",
          {
            category_data: categoryObject,
            category_lang_data: categoryLanguageData,
          }
        );

        if (error) {
          console.error("Error inserting category:", error);
          throw error;
        }

        update((currentCategories) => {
          return [...currentCategories, ...(data || [])];
        });

        return data;
      } catch (error) {
        console.error("Failed to insert category:", error);
        throw error;
      }
    },
    updateCategoryData: async (
      categoryObject: CategoryDataModel,
      categoryLanguageData: CategoryLanguageModel[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "update_categories_and_category_translations",
          {
            category_data: categoryObject,
            category_lang_data: categoryLanguageData,
          }
        );

        if (error) {
          console.error("Error updating category:", error);
          throw error;
        }

        update((currentCategories) => {
          return currentCategories.map((category) => {
            if (category.id === categoryObject.id) {
              return data ? data[0] : category;
            }
            return category;
          });
        });

        return data;
      } catch (error) {
        console.error("Failed to update category:", error);
        throw error;
      }
    },
  };
};

export const categoriesStore = createCategoriesStore();
