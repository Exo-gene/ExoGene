import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  PatientRegistrationDataModel,
  PatientRegistrationModel,
} from "../models/patientRegistrationModel";

const createPatientRegistrationStore = () => {
  const { subscribe, set, update } = writable<PatientRegistrationModel[]>([]);

  return {
    subscribe,
    set: (registrations: PatientRegistrationModel[]) => {
      set(registrations);
    },
    getPatientRegistrationData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number,
      phonenumber?: string,
      name?: string
    ) => {
      const params: any = {
        page_size: pageSize,
        page_num: pageNum,
      };

      if (phonenumber) {
        params._phonenumber = phonenumber;
      }
      if (name) {
        params._name = name;
      }

      let query = await supabase.rpc(
        "get_paginated_patient_registration_data",
        params
      );

      if (query.error) {
        console.error("Error fetching PatientRegistration:", query.error);
        set([]);
      } else {
        set(query.data || []);
      }
    },
    insertPatientRegistrationData: async (
      patientRegistrationObject: Omit<PatientRegistrationDataModel, "id">,
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase
          .from("patient_registration")
          .insert([patientRegistrationObject]);

        if (error) {
          console.error("Error inserting PatientRegistration:", error);
          throw error;
        }

        update((currentRegistrationData) => {
          return [...currentRegistrationData, ...(data || [])];
        });

        return data;
      } catch (error) {
        console.error("Failed to insert PatientRegistration:", error);
        throw error;
      }
    },
    updatePatientRegistrationData: async (
      patientRegistrationObject: Partial<PatientRegistrationDataModel>,
      patientRegistrationId: number,
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase
          .from("patient_registration")
          .update(patientRegistrationObject)
          .eq("id", patientRegistrationId);

        if (error) {
          console.error("Error updating PatientRegistration:", error);
          throw error;
        }

        update((registrations) => {
          const index = registrations.findIndex(
            (patientRegistration) =>
              patientRegistration.id === patientRegistrationId
          );
          if (index !== -1) {
            registrations[index] = {
              ...registrations[index],
              ...patientRegistrationObject,
            };
          }
          return registrations;
        });

        return data;
      } catch (error) {
        console.error("Failed to update PatientRegistration:", error);
        throw error;
      }
    },
  };
};

export const patientRegistrationStore = createPatientRegistrationStore();
