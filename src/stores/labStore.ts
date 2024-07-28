import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";


const createLabStore = () => {
  const { subscribe, set, update } = writable<any[]>([]);

  return {
    subscribe,
    set: (lab: any[]) => {
      set(lab);
    },
    getLabData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paginated_lab_data", {
        page_size: pageSize,
        page_num: pageNum,
      });

      if (query.error) {
        console.error("Error fetching lab:", query.error);
        set([]);
      } else {
        set(query.data || []);
      }
    },
    deleteLabData: async (labId: number, supabase: SupabaseClient) => {
      try {
        const { error } = await supabase.rpc(
          "delete_lab_and_lab_translations",
          {
            data: { id: labId },
          }
        );

        if (error) {
          console.error("Error deleting lab:", error);
          throw error;
        }

        update((currentLabDataId) =>
          currentLabDataId.filter((lab) => lab.id !== labId)
        );
      } catch (error) {
        console.error("Failed to delete lab:", error);
        throw error;
      }
    },
    insertLabData: async (
      labObject: any,
      labLanguageData: any[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "insert_lab_and_lab_translations",
          {
            advertisement_data: labObject,
            advertisement_lang_data: labLanguageData,
          }
        );

        if (error) {
          console.error("Error inserting lab:", error);
          throw error;
        }

        update((currentLabData) => {
          return [...currentLabData, ...(data || [])];
        });

        return data;
      } catch (error) {
        console.error("Failed to insert lab:", error);
        throw error;
      }
    },
    updateLabData: async (
      labObject: any,
      labLanguageData: any[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc("update_lab", {
          advertisement_data: labObject,
          advertisement_lang_data: labLanguageData,
        });

        if (error) {
          console.error("Error updating lab:", error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error("Failed to update lab:", error);
        throw error;
      }
    },
  };
};

export const labStore = createLabStore();
