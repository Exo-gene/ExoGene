import type { LanguageEnum } from "./languageEnum";

export interface CategoryModel {
  count: number;
  items: CategoryDataModel[];
  page: number;
  page_limit: number;
  remainingitems: number;
}
export interface CategoryDataModel {
  id: number;
  created_at: Date;
  categorytranslation: CategoryLanguageModel[];
}

export interface CategoryLanguageModel {
  id: number;
  category_id: number;
  title: string;
  language: LanguageEnum;
  created_at: Date;
}
