import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryModel } from "../models/categoryModel";

export const categoriesStore = writable<CategoryModel[]>([]);

//Get all data
export const getCategoriesData = async (supabase: SupabaseClient) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*,category_translations(*)")
      .order("created_at", { ascending: false });
    return categoriesStore.set(data as CategoryModel[]);
  } catch (error) {
    throw error;
  }
};

//delete by id
export const deleteCategoryData = async (
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
      throw error;
    }

    categoriesStore.update((currentCategories) => {
      return currentCategories.filter((category) => category.id !== categoryId);
    });
  } catch (error) {
    throw error;
  }
};
