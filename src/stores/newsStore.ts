import { writable } from "svelte/store";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  NewsDataModel,
  NewsLanguageModel,
  NewsModel,
} from "../models/newsModel";

const createNewsStore = () => {
  const { subscribe, set, update } = writable<NewsModel[]>([]);

  return {
    subscribe,
    set: (news: NewsModel[]) => {
      set(news);
    },

    getNewsData: async (
      supabase: SupabaseClient,
      pageSize: number,
      pageNum: number
    ) => {
      let query = await supabase.rpc("get_paged_news", {
        page_size: pageSize,
        page_num: pageNum,
      });

      if (query.error) {
        console.error("Error fetching news:", query.error);
        set([]);
      } else {
        set(query.data || []);
      }
    },
    deleteNewsData: async (newsId: number, supabase: SupabaseClient) => {
      try {
        const { error } = await supabase.rpc(
          "delete_news_and_news_translations",
          {
            data: { id: newsId },
          }
        );

        if (error) {
          console.error("Error deleting news:", error);
          throw error;
        }

        update((currentNews) =>
          currentNews.filter((news) => news.id !== newsId)
        );
      } catch (error) {
        console.error("Failed to delete news:", error);
        throw error;
      }
    },
    insertNewsData: async (
      newsObject: any,
      newsLanguageData: any[],
      category_ids_data: any[],
      subcategory_ids_data: any[],
      tag_ids_data: any[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "insert_news_and_related_data",
          {
            news_data: newsObject,
            news_lang_data: newsLanguageData,
            category_ids_data,
            subcategory_ids_data,
            tag_ids_data,
          }
        );

        if (error) {
          console.error("Error inserting news:", error);
          throw error;
        }

        update((currentNews) => {
          return [...currentNews, ...(data || [])];
        });

        return data;
      } catch (error) {
        console.error("Failed to insert news:", error);
        throw error;
      }
    },
    updateNewsData: async (
      existingNewsId: number,
      newsObject: any,
      newsLanguageData: any[],
      categoryData: any[],
      subcategoryData: any[],
      tagData: any[],
      supabase: SupabaseClient
    ) => {
      try {
        const { data, error } = await supabase.rpc(
          "update_news_and_related_data",
          {
            category_ids_data: categoryData,
            existing_news_id: existingNewsId,
            news_lang_data: newsLanguageData,
            subcategory_ids_data: subcategoryData,
            tag_ids_data: tagData,
          }
        );

        if (error) {
          console.error("Error updating news:", error);
          throw error;
        }

        update((currentNews) => {
          return currentNews.map((news) => {
            if (news.id === newsObject.id) {
              return data ? data[0] : news;
            }
            return news;
          });
        });

        return data;
      } catch (error) {
        console.error("Failed to update news:", error);
        throw error;
      }
    },
  };
};

export const newsStore = createNewsStore();
