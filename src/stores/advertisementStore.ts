import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdvertisementDataModel,
  AdvertisementDataModelToUpdate,
  AdvertisementLanguageModel,
  AdvertisementLanguageModelToUpdate,
  AdvertisementModel,
} from "../models/advertisementModel";

const createAdvertisementStore = () => {
  const { subscribe, set, update } = writable<AdvertisementModel[]>([]);

  return {
    subscribe,
    set: (advertisement: AdvertisementModel[]) => {
      set(advertisement);
    },
    getAdvertisementData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paged_advertisement", {
        page_size: pageSize,
        page_num: pageNum,
      });

      if (query.error) {
        console.error("Error fetching Advertisement:", query.error);
        set([]);
      } else {
        console.log("Advertisement data:", query.data);
        set(query.data || []);
      }
    },
    deleteAdvertisementData: async (
      advertisementId: number,
      supabase: SupabaseClient
    ) => {
      try {
        const { error } = await supabase.rpc(
          "delete_advertisement_and_advertisement_translations",
          {
            data: { id: advertisementId },
          }
        );

        if (error) {
          console.error("Error deleting advertisement:", error);
          throw error;
        }

        update((currentAdvertisementId) =>
          currentAdvertisementId.filter(
            (advertisement) => advertisement.id !== advertisementId
          )
        );
      } catch (error) {
        console.error("Failed to delete advertisement:", error);
        throw error;
      }
    },
    insertAdvertisementData: async (
      advertisementObject: any,
      advertisementLanguageData: any[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "insert_advertisements_and_advertisement_translations",
          {
            advertisement_data: advertisementObject,
            advertisement_lang_data: advertisementLanguageData,
          }
        );

        if (error) {
          console.error("Error inserting advertisement:", error);
          throw error;
        }

        update((currentAdvertisement) => {
          return [...currentAdvertisement, ...(data || [])];
        });

        return data;
      } catch (error) {
        console.error("Failed to insert advertisement:", error);
        throw error;
      }
    },
    updateAdvertisementData: async (
      advertisementObject: AdvertisementDataModelToUpdate,
      advertisementLanguageData: AdvertisementLanguageModelToUpdate[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc("update_advertisement", {
          advertisement_data: advertisementObject,
          advertisement_lang_data: advertisementLanguageData,
        });

        if (error) {
          console.error("Error updating advertisement:", error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error("Failed to update advertisement:", error);
        throw error;
      }
    },
  };
};

export const advertisementStore = createAdvertisementStore();
