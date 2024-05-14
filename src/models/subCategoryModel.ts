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
}

export interface SubCategoryLanguageModel {
  title: string;
  language: LanguageEnum;
}
