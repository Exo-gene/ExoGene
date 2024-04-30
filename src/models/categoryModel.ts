import type { LanguageEnum } from "./languageEnum";

export interface CategoryModel {
  id: number;
  created_at: Date;
  category_translations: CategoryLangModel[];
}

export interface CategoryLangModel {
  id: number;
  category_id: number;
  title: string;
  language: LanguageEnum;
  created_at: Date;
}
