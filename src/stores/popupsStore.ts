import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  PopupsDataModel,
  PopupsDataModelToUpdate,
  PopupsLanguageModel,
  PopupsLanguageModelToUpdate,
  PopupsModel,
} from "../models/popupsModel";

const createPopupsStore = () => {
  const { subscribe, set, update } = writable<PopupsModel[]>([]);

  return {
    subscribe,
    set: (popups: PopupsModel[]) => {
      set(popups);
    },
    getPopupsData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paginated_popups", {
        page_size: pageSize,
        page_num: pageNum,
      });

      if (query.error) {
        console.error("Error fetching Popups:", query.error);
        set([]);
      } else {
        set(query.data || []);
      }
    },
    deletePopupsData: async (PopupsId: number, supabase: SupabaseClient) => {
      try {
        const { error } = await supabase.rpc(
          "delete_popup_and_popup_translations",
          {
            data: { id: PopupsId },
          }
        );

        if (error) {
          console.error("Error deleting Popup:", error);
          throw error;
        }

        update((currentPopupsId) =>
          currentPopupsId.filter((popups) => popups.id !== PopupsId)
        );
      } catch (error) {
        console.error("Failed to delete popup:", error);
        throw error;
      }
    },
    insertPopupsData: async (
      popupsObject: any,
      popupsLanguageData: any[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "insert_popup_and_popup_translations",
          {
            popup_data: popupsObject,
            popup_lang_data: popupsLanguageData,
          }
        );

        if (error) {
          console.error("Error inserting Popup:", error);
          throw error;
        }

        update((currentPopups) => {
          return [...currentPopups, ...(data || [])];
        });

        return data;
      } catch (error) {
        console.error("Failed to insert Popup:", error);
        throw error;
      }
    },
    updatePopupsData: async (
      popupsObject: PopupsDataModelToUpdate,
      popupsLanguageData: PopupsLanguageModelToUpdate[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc("update_popups", {
          popups_data: popupsObject,
          popups_lang_data: popupsLanguageData,
        });

        if (error) {
          console.error("Error updating Popups:", error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error("Failed to update Popups:", error);
        throw error;
      }
    },
  };
};

export const popupsStore = createPopupsStore();
