import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  TagDataModel,
  TagLanguageModel,
  TagLanguageModelToUpdate,
  TagModel,
} from "../models/tagModel";

const createTagsStore = () => {
  const { subscribe, set, update } = writable<TagModel[]>([]);

  return {
    subscribe,
    set: (tags: TagModel[]) => {
      set(tags);
    },
    getTagsData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paged_tags", {
        page_size: pageSize,
        page_num: pageNum,
      });

      if (query.error) {
        console.error("Error fetching tags:", query.error);
        set([]);
      } else {
        set(query.data || []);
      }
    },
    deleteTagData: async (tagId: number, supabase: SupabaseClient) => {
      try {
        const { error } = await supabase.rpc(
          "delete_tags_and_tag_translations",
          {
            data: { id: tagId },
          }
        );

        if (error) {
          console.error("Error deleting tag:", error);
          throw error;
        }

        update((currentCategories) =>
          currentCategories.filter((tag) => tag.id !== tagId)
        );
      } catch (error) {
        console.error("Failed to delete tag:", error);
        throw error;
      }
    },
    insertTagData: async (
      tagsObject: any,
      tagLanguageData: TagLanguageModel[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "insert_tags_and_tag_translations",
          {
            tag_data: tagsObject,
            tag_lang_data: tagLanguageData,
          }
        );

        if (error) {
          console.error("Error inserting tag:", error);
          throw error;
        }

        update((currentTag) => {
          return [...currentTag, ...(data || [])];
        });

        return data;
      } catch (error) {
        console.error("Failed to insert tag:", error);
        throw error;
      }
    },
    updateTagData: async (
      tagsObject: TagDataModel,
      tagLanguageData: TagLanguageModelToUpdate[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "update_tags_and_tag_translations",
          {
            tag_data: tagsObject,
            tag_lang_data: tagLanguageData,
          }
        );

        if (error) {
          console.error("Error updating tag:", error);
          throw error;
        }

        update((currentTags) => {
          return currentTags.map((tag) => {
            if (tag.id === tagsObject.id) {
              return data ? data[0] : tag;
            }
            return tag;
          });
        });

        return data;
      } catch (error) {
        console.error("Failed to update tag:", error);
        throw error;
      }
    },
  };
};

export const tagStore = createTagsStore();
