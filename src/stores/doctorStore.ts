import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DoctorDataModel, DoctorModel } from "../models/doctorModel";

const createDoctorStore = () => {
  const { subscribe, set, update } = writable<DoctorModel[]>([]);

  return {
    subscribe,
    set: (doctors: DoctorModel[]) => {
      set(doctors);
    },
    getDoctorData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paginated_doctor_data", {
        page_size: pageSize,
        page_num: pageNum,
      });

      if (query.error) {
        console.error("Error fetching doctor:", query.error);
        set([]);
      } else {
        set(query.data || []);
      }
    },
    deleteDoctorData: async (doctorId: number, supabase: SupabaseClient) => {
      try {
        const { error } = await supabase.rpc("delete_doctorData", {
          data: { id: doctorId },
        });

        if (error) {
          console.error("Error deleting doctor:", error);
          throw error;
        }

        update((currentDoctorData) =>
          currentDoctorData.filter((doctor) => doctor.id !== doctorId)
        );
      } catch (error) {
        console.error("Failed to delete doctor:", error);
        throw error;
      }
    },
    insertDoctorData: async (
      doctorObject: Omit<DoctorDataModel, "id">,
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase
          .from("doctor")
          .insert([
            { name: doctorObject.name, phonenumber: doctorObject.phonenumber },
          ]);

        if (error) {
          console.error("Error inserting doctor:", error);
          throw error;
        }

        update((currentDoctorData) => {
          return [...currentDoctorData, ...(data || [])];
        });

        return data;
      } catch (error) {
        console.error("Failed to insert doctor:", error);
        throw error;
      }
    },
    updateDoctorData: async (
      doctorObject: Partial<DoctorDataModel>,
      doctorId: number,
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase
          .from("doctor")
          .update(doctorObject)
          .eq("id", doctorId);

        if (error) {
          console.error("Error updating doctor:", error);
          throw error;
        }

        update((doctors) => {
          const index = doctors.findIndex((doctor) => doctor.id === doctorId);
          if (index !== -1) {
            doctors[index] = { ...doctors[index], ...doctorObject };
          }
          return doctors;
        });

        return data;
      } catch (error) {
        console.error("Failed to update doctor:", error);
        throw error;
      }
    },
  };
};

export const doctorStore = createDoctorStore();
