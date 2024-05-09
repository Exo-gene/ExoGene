import type { LanguageEnum } from "./languageEnum";

export interface NewsModel {
  count: number;
  items: NewsDataModel[];
  page: number;
  page_limit: number;
  remainingItems: number;
}
export interface NewsDataModel {
  id: number;
  created_at: Date;
  title: string;
  newstranslation: NewsLanguageModel[];
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
