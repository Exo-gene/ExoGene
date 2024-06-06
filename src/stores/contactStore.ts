import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ContactDataModel,
  ContactLanguageModelToUpdate,
  ContactModel,
} from "../models/contactModel";

const createContactStore = () => {
  const { subscribe, set, update } = writable<ContactModel[]>([]);

  return {
    subscribe,
    set: (contact: ContactModel[]) => {
      set(contact);
    },
    updateContactData: async (
      contactObject: ContactDataModel,
      contactLanguageData: ContactLanguageModelToUpdate[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "update_contact_and_contact_translations",
          {
            contact_data: contactObject,
            contact_lang_data: contactLanguageData,
          }
        );

        if (error) {
          console.error("Error updating contact:", error);
          throw error;
        }

        update((currentContact) => {
          return currentContact.map((contact) => {
            if (contact.id === contactObject.id) {
              return data ? data[0] : contact;
            }
            return contact;
          });
        });

        return data;
      } catch (error) {
        console.error("Failed to update contact:", error);
        throw error;
      }
    },
  };
};

export const contactStore = createContactStore();
