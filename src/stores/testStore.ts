import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TestDataModel, TestModel } from "../models/testModel";

const createTestStore = () => {
  const { subscribe, set, update } = writable<TestModel[]>([]);

  return {
    subscribe,
    set: (tests: TestModel[]) => {
      set(tests);
    },
    getTestData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paginated_test_data", {
        page_size: pageSize,
        page_num: pageNum,
      });

      if (query.error) {
        console.error("Error fetching test:", query.error);
        set([]);
      } else {
        set(query.data || []);
      }
    },
    deleteTestData: async (testId: number, supabase: SupabaseClient) => {
      try {
        const { error } = await supabase.rpc("delete_testData", {
          data: { id: testId },
        });

        if (error) {
          console.error("Error deleting test:", error);
          throw error;
        }

        update((currentTestData) =>
          currentTestData.filter((test) => test.id !== testId)
        );
      } catch (error) {
        console.error("Failed to delete test:", error);
        throw error;
      }
    },
    insertTestData: async (
      testObject: Omit<TestDataModel, "id">,
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase
          .from("test")
          .insert([{ name: testObject.name, price: testObject.price }]);

        if (error) {
          console.error("Error inserting test:", error);
          throw error;
        }

        update((currentTestData) => {
          return [...currentTestData, ...(data || [])];
        });

        return data;
      } catch (error) {
        console.error("Failed to insert test:", error);
        throw error;
      }
    },
    updateTestData: async (
      testObject: Partial<TestDataModel>,
      testId: number,
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase
          .from("test")
          .update(testObject)
          .eq("id", testId);

        if (error) {
          console.error("Error updating test:", error);
          throw error;
        }

        update((tests) => {
          const index = tests.findIndex((test) => test.id === testId);
          if (index !== -1) {
            tests[index] = { ...tests[index], ...testObject };
          }
          return tests;
        });

        return data;
      } catch (error) {
        console.error("Failed to update test:", error);
        throw error;
      }
    },
  };
};

export const testStore = createTestStore();
