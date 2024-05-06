import type { LanguageEnum } from "./languageEnum";

export interface SubCategoryModel {
  id: number;
  count: number;
  items: SubCategoryDataModel[];
  page: number;
  page_limit: number;
  remainingitems: number;
}
export interface SubCategoryDataModel {
  id: number;
  category_id: number;
  created_at: Date;
}

export interface SubCategoryLanguageModel {
  title: string;
  language: LanguageEnum;
  created_at: Date;
}
