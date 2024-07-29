import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  SampleTypeDataModel,
  SampleTypeModel,
} from "../models/sampleTypeModel";

const createSampleTypeStore = () => {
  const { subscribe, set, update } = writable<SampleTypeModel[]>([]);

  return {
    subscribe,
    set: (sampleTypes: SampleTypeModel[]) => {
      set(sampleTypes);
    },
    getSampleTypesData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paginated_sampletype_data", {
        page_size: pageSize,
        page_num: pageNum,
      });

      if (query.error) {
        console.error("Error fetching sampleType:", query.error);
        set([]);
      } else {
        set(query.data || []);
      }
    },
    deleteSampleTypeData: async (
      sampleTypeId: number,
      supabase: SupabaseClient
    ) => {
      try {
        const { error } = await supabase.rpc("delete_sample_type_data", {
          data: { id: sampleTypeId },
        });

        if (error) {
          console.error("Error deleting sampleType:", error);
          throw error;
        }

        update((currentSampleTypeData) =>
          currentSampleTypeData.filter(
            (sampleType) => sampleType.id !== sampleTypeId
          )
        );
      } catch (error) {
        console.error("Failed to delete sampleType:", error);
        throw error;
      }
    },
    insertSampleTypeData: async (
      sampleTypeObject: Omit<SampleTypeDataModel, "id">,
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase
          .from("sampletype")
          .insert([{ name: sampleTypeObject.name }]);

        if (error) {
          console.error("Error inserting sampleType:", error);
          throw error;
        }

        update((currentSampleTypeData) => {
          return [...currentSampleTypeData, ...(data || [])];
        });

        return data;
      } catch (error) {
        console.error("Failed to insert sampleType:", error);
        throw error;
      }
    },
    updateSampleTypeData: async (
      sampleTypeObject: Partial<SampleTypeDataModel>,
      sampleTypeId: number,
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase
          .from("sampletype")
          .update(sampleTypeObject)
          .eq("id", sampleTypeId);

        if (error) {
          console.error("Error updating sampleType:", error);
          throw error;
        }

        update((sampleTypes) => {
          const index = sampleTypes.findIndex(
            (sampleType) => sampleType.id === sampleTypeId
          );
          if (index !== -1) {
            sampleTypes[index] = { ...sampleTypes[index], ...sampleTypeObject };
          }
          return sampleTypes;
        });

        return data;
      } catch (error) {
        console.error("Failed to update sampleType:", error);
        throw error;
      }
    },
  };
};

export const sampleTypeStore = createSampleTypeStore();
