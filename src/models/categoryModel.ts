import type { LanguageEnum } from "./languageEnum";

export interface CategoryModel {
  id: number;
  count: number;
  items: CategoryDataModel[];
  page: number;
  page_limit: number;
  remainingitems: number;
}
export interface CategoryDataModel {
  id: number; 
}

export interface CategoryLanguageModel {
  title: string;
  language: LanguageEnum; 
}

export interface CategoryLanguageModelToUpdate {
  title: string;
  language: LanguageEnum;
}

export interface categoryId {
  category_id: number;
}



export interface FormData {
  title: string | null;
  titleError: string;
}

export interface FormDataSet {
  [key: string]: FormData;
}

export interface LanguageObject {
  title: string;
  language: LanguageEnum;
}

 
