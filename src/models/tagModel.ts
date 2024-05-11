import type { LanguageEnum } from "./languageEnum";

export interface TagModel {
  id: number;
  count: number;
  items: TagDataModel[];
  page: number;
  page_limit: number;
  remainingitems: number;
}

export interface TagDataModel {
  id: number; 
}

export interface TagLanguageModel {
  id: number;
  tag_id: number;
  title: string;
  language: LanguageEnum;
  created_at: Date;
}

export interface TagLanguageModelToUpdate {
  title: string;
  language: LanguageEnum;
  created_at: Date;
}
