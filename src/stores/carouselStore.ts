import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CarouselDataModel,
  CarouselLanguageModelToUpdate,
  CarouselLanguageModel,
  CarouselDataModelToUpdate,
  CarouselModel,
} from "../models/carouselModel";

const createCarouselStore = () => {
  const { subscribe, set, update } = writable<CarouselModel[]>([]);

  return {
    subscribe,
    set: (carousel: CarouselModel[]) => {
      set(carousel);
    },
    getCarouselData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paged_carousel", {
        page_size: pageSize,
        page_num: pageNum,
      });

      if (query.error) {
        console.error("Error fetching Carousel:", query.error);
        set([]);
      } else {
        set(query.data || []);
      }
    },
    deleteCarouselData: async (
      carouselId: number,
      supabase: SupabaseClient
    ) => {
      try {
        const { error } = await supabase.rpc(
          "delete_carousel_and_carousel_translations",
          {
            data: { id: carouselId },
          }
        );

        if (error) {
          console.error("Error deleting carousel:", error);
          throw error;
        }

        update((currentCarouselId) =>
          currentCarouselId.filter((carousel) => carousel.id !== carouselId)
        );
      } catch (error) {
        console.error("Failed to delete carousel:", error);
        throw error;
      }
    },
    insertCarouselData: async (
      carouselObject: any,
      carouselLanguageData: any[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "insert_carousel_and_carousel_translations",
          {
            carousel_data: carouselObject,
            carousel_lang_data: carouselLanguageData,
          }
        );

        if (error) {
          console.error("Error inserting carousel :", error);
          throw error;
        }

        update((currentCarousel) => {
          return [...currentCarousel, ...(data || [])];
        });
        return data;
      } catch (error) {
        console.error("Failed to insert carousel:", error);
        throw error;
      }
    },
    updateCarouselData: async (
      carouselObject: CarouselLanguageModelToUpdate,
      carouselLanguageData: CarouselDataModelToUpdate[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "update_carousel_and_carousel_translations",
          {
            carousel_data: carouselObject,
            carousel_lang_data: carouselLanguageData,
          }
        );

        if (error) {
          console.error("Error updating carousel:", error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error("Failed to update carousel:", error);
        throw error;
      }
    },
  };
};

export const carouselStore = createCarouselStore();
