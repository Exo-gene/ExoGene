import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LabDataModel, LabModel } from "../models/labModel";

const createLabStore = () => {
  const { subscribe, set, update } = writable<LabModel[]>([]);

  return {
    subscribe,
    set: (labs: LabModel[]) => {
      set(labs);
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
        const { error } = await supabase.rpc("delete_labData", {
          data: { id: labId },
        });

        if (error) {
          console.error("Error deleting lab:", error);
          throw error;
        }

        update((currentLabData) =>
          currentLabData.filter((lab) => lab.id !== labId)
        );
      } catch (error) {
        console.error("Failed to delete lab:", error);
        throw error;
      }
    },
    insertLabData: async (
      labObject: Omit<LabDataModel, "id">,
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase
          .from("lab")
          .insert([{ name: labObject.name, address: labObject.address }]);

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
      labObject: Partial<LabDataModel>,
      labId: number,
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase
          .from("lab")
          .update(labObject)
          .eq("id", labId);

        if (error) {
          console.error("Error updating lab:", error);
          throw error;
        }

        update((labs) => {
          const index = labs.findIndex((lab) => lab.id === labId);
          if (index !== -1) {
            labs[index] = { ...labs[index], ...labObject };
          }
          return labs;
        });

        return data;
      } catch (error) {
        console.error("Failed to update lab:", error);
        throw error;
      }
    },
  };
};

export const labStore = createLabStore();
