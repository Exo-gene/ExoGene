import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { StoreDataModel, StoreModel } from "../models/storeModel";

const createStoreDataStore = () => {
  const { subscribe, set, update } = writable<StoreModel[]>([]);

  return {
    subscribe,
    set: (stores: StoreModel[]) => {
      set(stores);
    },
    getStoreData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paginated_store_data", {
        page_size: pageSize,
        page_num: pageNum,
      });

      if (query.error) {
        console.error("Error fetching store:", query.error);
        set([]);
      } else {
        set(query.data || []);
      }
    },
    deleteStoreData: async (storeId: number, supabase: SupabaseClient) => {
      try {
        const { error } = await supabase.rpc("delete_storeData", {
          data: { id: storeId },
        });

        if (error) {
          console.error("Error deleting store:", error);
          throw error;
        }

        update((currentStoreData) =>
          currentStoreData.filter((store) => store.id !== storeId)
        );
      } catch (error) {
        console.error("Failed to delete store:", error);
        throw error;
      }
    },
    insertStoreData: async (
      storeObject: Omit<StoreDataModel, "id">,
      supabase: SupabaseClient
    ) => {
      try {
         const { data, error } = await supabase
           .from("store")
           .insert([storeObject]);

        if (error) {
          console.error("Error inserting store:", error);
          throw error;
        }

        update((currentStoreData) => {
          return [...currentStoreData, ...(data || [])];
        });

        return data;
      } catch (error) {
        console.error("Failed to insert store:", error);
        throw error;
      }
    },
    updateStoreData: async (
      storeObject: Partial<StoreDataModel>,
      storeId: number,
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase
          .from("store")
          .update(storeObject)
          .eq("id", storeId);

        if (error) {
          console.error("Error updating store:", error);
          throw error;
        }

        update((stores) => {
          const index = stores.findIndex((store) => store.id === storeId);
          if (index !== -1) {
            stores[index] = { ...stores[index], ...storeObject };
          }
          return stores;
        });

        return data;
      } catch (error) {
        console.error("Failed to update store:", error);
        throw error;
      }
    },
  };
};

export const storeDataStore = createStoreDataStore();
