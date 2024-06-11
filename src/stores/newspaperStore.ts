import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  NewspaperDataModel,
  NewspaperLanguageModelToUpdate,
  NewspaperModel,
} from "../models/newspaperModel";

const createNewspaperStore = () => {
  const { subscribe, set, update } = writable<NewspaperModel[]>([]);

  return {
    subscribe,
    set: (newspaper: NewspaperModel[]) => {
      set(newspaper);
    },
    getNewspaperData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paginated_newspaper", {
        page_size: pageSize,
        page_num: pageNum,
      });

      if (query.error) {
        console.error("Error fetching newspaper:", query.error);
        set([]);
      } else {
        set(query.data || []);
      }
    },
    deleteNewspaperData: async (
      newspaperId: number,
      supabase: SupabaseClient
    ) => {
      try {
        const { error } = await supabase.rpc(
          "delete_newspaper_and_newspaper_translations",
          {
            data: { id: newspaperId },
          }
        );

        if (error) {
          console.error("Error deleting newspaper:", error);
          throw error;
        }

        update((currentNewspaperId) =>
          currentNewspaperId.filter((newspaper) => newspaper.id !== newspaperId)
        );
      } catch (error) {
        console.error("Failed to delete newspaper:", error);
        throw error;
      }
    },
    insertNewspaperData: async (
      newspaperObject: any,
      newspaperLanguageData: any[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "insert_newspaper_and_newspaper_translations",
          {
            newspaper_data: newspaperObject,
            newspaper_lang_data: newspaperLanguageData,
          }
        );

        if (error) {
          console.error("Error inserting newspaper :", error);
          throw error;
        }

        update((currentNewspaper) => {
          return [...currentNewspaper, ...(data || [])];
        });
        return data;
      } catch (error) {
        console.error("Failed to insert newspaper:", error);
        throw error;
      }
    },
    updateNewspaperData: async (
      newspaperObject: NewspaperDataModel,
      newspaperLanguageData: NewspaperLanguageModelToUpdate[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "update_newspaper_and_newspaper_translations",
          {
            newspaper_data: newspaperObject,
            newspaper_lang_data: newspaperLanguageData,
          }
        );

        if (error) {
          console.error("Error updating newspaper:", error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error("Failed to update newspaper:", error);
        throw error;
      }
    },
  };
};

export const newspaperStore = createNewspaperStore();
