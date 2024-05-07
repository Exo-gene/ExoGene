import type { LanguageEnum } from "./languageEnum";

export interface NewsModel {
  id: number;
  count: number;
  items: NewsDataModel[];
  page: number;
  page_limit: number;
  remainingitems: number;
}
export interface NewsDataModel {
  id: number;
  created_at: Date;
  image: string;
  view_count: number;
  news_translations: NewsLanguageModel[];
}

export interface NewsLanguageModel {
  id: number;
  news_id: number;
  title: string;
  description: string;
  subtitle: string;
  language: LanguageEnum;
  created_at: Date;
}

export interface NewsLanguageModelToUpdate {
  title: string;
  language: LanguageEnum;
  created_at: Date;
}
