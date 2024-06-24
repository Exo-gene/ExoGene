import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
// import type {
//   AdvertisementDataModel,
//   AdvertisementDataModelToUpdate,
//   AdvertisementLanguageModel,
//   AdvertisementLanguageModelToUpdate,
//   AdvertisementModel,
// } from "../models/advertisementModel";

const createPopupsStore = () => {
  const { subscribe, set, update } = writable<any[]>([]);

  return {
    subscribe,
    set: (popups: any[]) => {
      set(popups);
    },
    getPopupsData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paged_popups", {
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
          "delete_popups_and_popups_translations",
          {
            data: { id: PopupsId },
          }
        );

        if (error) {
          console.error("Error deleting Popups:", error);
          throw error;
        }

        update((currentPopupsId) =>
          currentPopupsId.filter((popups) => popups.id !== PopupsId)
        );
      } catch (error) {
        console.error("Failed to delete popups:", error);
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
          "insert_popups_and_popups_translations",
          {
            popups_data: popupsObject,
            popups_lang_data: popupsLanguageData,
          }
        );

        if (error) {
          console.error("Error inserting Popups:", error);
          throw error;
        }

        update((currentPopups) => {
          return [...currentPopups, ...(data || [])];
        });

        return data;
      } catch (error) {
        console.error("Failed to insert Popups:", error);
        throw error;
      }
    },
    updatePopupsData: async (
      popupsObject: any,
      popupsLanguageData: any[],
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
