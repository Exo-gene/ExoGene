import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    MagazineDataModel,
  MagazineLanguageModelToUpdate,
  MagazineModel,
} from "../models/magazineModel";

const createMagazinelStore = () => {
  const { subscribe, set, update } = writable<MagazineModel[]>([]);

  return {
    subscribe,
    set: (magazine: MagazineModel[]) => {
      set(magazine);
    },
    getMagazineData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paginated_magazine", {
        page_size: pageSize,
        page_num: pageNum,
      });

      if (query.error) {
        console.error("Error fetching magazine:", query.error);
        set([]);
      } else {
        set(query.data || []);
      }
    },
    deleteMagazineData: async (
      magazineId: number,
      supabase: SupabaseClient
    ) => {
      try {
        const { error } = await supabase.rpc(
          "delete_magazine_and_magazine_translations",
          {
            data: { id: magazineId },
          }
        );

        if (error) {
          console.error("Error deleting magazine:", error);
          throw error;
        }

        update((currentMagazinelId) =>
          currentMagazinelId.filter((magazine) => magazine.id !== magazineId)
        );
      } catch (error) {
        console.error("Failed to delete magazine:", error);
        throw error;
      }
    },
    insertMagazineData: async (
      magazineObject: any,
      magazineLanguageData: any[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "insert_magazine_and_magazine_translations",
          {
            magazine_data: magazineObject,
            magazine_lang_data: magazineLanguageData,
          }
        );

        if (error) {
          console.error("Error inserting magazine :", error);
          throw error;
        }

        update((currentMagazine) => {
          return [...currentMagazine, ...(data || [])];
        });
        return data;
      } catch (error) {
        console.error("Failed to insert magazine:", error);
        throw error;
      }
    },
    updateMagazineData: async (
      magazineObject: MagazineDataModel,
      magazineLanguageData: MagazineLanguageModelToUpdate[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "update_magazine_and_magazine_translations",
          {
            magazine_data: magazineObject,
            magazine_lang_data: magazineLanguageData,
          }
        );

        if (error) {
          console.error("Error updating magazine:", error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error("Failed to update magazine:", error);
        throw error;
      }
    },
  };
};

export const magazineStore = createMagazinelStore();
