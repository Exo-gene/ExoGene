import type { LanguageEnum } from "./languageEnum";

export interface AboutModel {
  id: number;
  count: number;
  items: AboutDataModel[];
  page: number;
  page_limit: number;
  remainingitems: number;
}

export interface AboutDataModel {
  id: number;
}

export interface AboutLanguageModel {
  description: string;
  language: LanguageEnum;
}

export interface AboutLanguageModelToUpdate {
  description: string;
  language: LanguageEnum;
}

export interface FormData {
  description: string | null;
  descriptionError: string;
}

export interface FormDataSet {
  [key: string]: FormData;
}

export interface LanguageObject {
  description: string;
  language: LanguageEnum;
}
