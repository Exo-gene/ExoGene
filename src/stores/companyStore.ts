import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CompanyDataModel, CompanyModel } from "../models/companyModel";

const createCompanyStore = () => {
  const { subscribe, set, update } = writable<CompanyModel[]>([]);

  return {
    subscribe,
    set: (companies: CompanyModel[]) => {
      set(companies);
    },
    getCompanyData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paginated_company_data", {
        page_size: pageSize,
        page_num: pageNum,
      });

      if (query.error) {
        console.error("Error fetching company:", query.error);
        set([]);
      } else {
        set(query.data || []);
      }
    },
    deleteCompanyData: async (companyId: number, supabase: SupabaseClient) => {
      try {
        const { error } = await supabase.rpc("delete_companyData", {
          data: { id: companyId },
        });

        if (error) {
          console.error("Error deleting company:", error);
          throw error;
        }

        update((currentCompanyData) =>
          currentCompanyData.filter((company) => company.id !== companyId)
        );
      } catch (error) {
        console.error("Failed to delete company:", error);
        throw error;
      }
    },
    insertCompanyData: async (
      companyObject: Omit<CompanyDataModel, "id">,
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase
          .from("company")
          .insert([
            { name: companyObject.name, address: companyObject.address },
          ]);

        if (error) {
          console.error("Error inserting company:", error);
          throw error;
        }

        update((currentCompanyData) => {
          return [...currentCompanyData, ...(data || [])];
        });

        return data;
      } catch (error) {
        console.error("Failed to insert company:", error);
        throw error;
      }
    },
    updateCompanyData: async (
      companyObject: Partial<CompanyDataModel>,
      companyId: number,
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase
          .from("company")
          .update(companyObject)
          .eq("id", companyId);

        if (error) {
          console.error("Error updating company:", error);
          throw error;
        }

        update((companies) => {
          const index = companies.findIndex((company) => company.id === companyId);
          if (index !== -1) {
            companies[index] = { ...companies[index], ...companyObject };
          }
          return companies;
        });

        return data;
      } catch (error) {
        console.error("Failed to update company:", error);
        throw error;
      }
    },
  };
};

export const companyStore = createCompanyStore();
