import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  EventDataModel,
  EventLanguageModel,
  EventLanguageModelToUpdate,
  EventModel,
} from "../models/eventModel";

const createEventStore = () => {
  const { subscribe, set, update } = writable<EventModel[]>([]);

  return {
    subscribe,
    set: (event: EventModel[]) => {
      set(event);
    },
    getEventData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paged_events", {
        page_size: pageSize,
        page_num: pageNum,
      });

      if (query.error) {
        console.error("Error fetching events:", query.error);
        set([]);
      } else {
        set(query.data || []);
      }
    },
    deleteEventData: async (eventId: number, supabase: SupabaseClient) => {
      try {
        const { error } = await supabase.rpc(
          "delete_events_and_event_translations",
          {
            data: { id: eventId },
          }
        );

        if (error) {
          console.error("Error deleting event:", error);
          throw error;
        }

        update((currentCategories) =>
          currentCategories.filter((event) => event.id !== eventId)
        );
      } catch (error) {
        console.error("Failed to delete event:", error);
        throw error;
      }
    },
    insertEventData: async (
      eventObject: any,
      eventLanguageData: EventLanguageModel[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "insert_events_and_event_translations",
          {
            event_data: eventObject,
            event_lang_data: eventLanguageData,
          }
        );

        if (error) {
          console.error("Error inserting event:", error);
          throw error;
        }

        update((currentEvent) => {
          return [...currentEvent, ...(data || [])];
        });

        return data;
      } catch (error) {
        console.error("Failed to insert event:", error);
        throw error;
      }
    },
    updateEventData: async (
      eventObject: EventDataModel,
      eventLanguageData: EventLanguageModelToUpdate[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "update_events_and_event_translations",
          {
            event_data: eventObject,
            event_lang_data: eventLanguageData,
          }
        );

        if (error) {
          console.error("Error updating event:", error);
          throw error;
        }

        update((currentEvent) => {
          return currentEvent.map((event) => {
            if (event.id === eventObject.id) {
              return data ? data[0] : event;
            }
            return event;
          });
        });

        return data;
      } catch (error) {
        console.error("Failed to update event:", error);
        throw error;
      }
    },
  };
};

export const eventStore = createEventStore();
