import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { StatusDataModel, StatusModel } from "../models/statusModel";

const createStatusStore = () => {
  const { subscribe, set, update } = writable<StatusModel[]>([]);

  return {
    subscribe,
    set: (statusData: StatusModel[]) => {
      set(statusData);
    },
    getStatusData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paginated_status_data", {
        page_size: pageSize,
        page_num: pageNum,
      });

      if (query.error) {
        console.error("Error fetching status:", query.error);
        set([]);
      } else {
        set(query.data || []);
      }
    },
    deleteStatusData: async (statusId: number, supabase: SupabaseClient) => {
      try {
        const { error } = await supabase.rpc("delete_statusData", {
          data: { id: statusId },
        });

        if (error) {
          console.error("Error deleting status:", error);
          throw error;
        }

        update((currentStatusData) =>
          currentStatusData.filter((status) => status.id !== statusId)
        );
      } catch (error) {
        console.error("Failed to delete status:", error);
        throw error;
      }
    },
    insertStatusData: async (
      statusObject: Omit<StatusDataModel, "id">,
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase
          .from("status")
          .insert([{ name: statusObject.name }]);

        if (error) {
          console.error("Error inserting status:", error);
          throw error;
        }

        update((currentStatusData) => {
          return [...currentStatusData, ...(data || [])];
        });

        return data;
      } catch (error) {
        console.error("Failed to insert status:", error);
        throw error;
      }
    },
    updateStatusData: async (
      statusObject: Partial<StatusDataModel>,
      statusId: number,
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase
          .from("status")
          .update(statusObject)
          .eq("id", statusId);

        if (error) {
          console.error("Error updating status:", error);
          throw error;
        }

        update((statusData) => {
          const index = statusData.findIndex(
            (status) => status.id === statusId
          );
          if (index !== -1) {
            statusData[index] = { ...statusData[index], ...statusObject };
          }
          return statusData;
        });

        return data;
      } catch (error) {
        console.error("Failed to update status:", error);
        throw error;
      }
    },
  };
};

export const statusStore = createStatusStore();
