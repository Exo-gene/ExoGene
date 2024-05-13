import type { LanguageEnum } from "./languageEnum";

export interface NewsModel {
  id: number;
  count: number;
  items: NewsDataModel[];
  page: number;
  page_limit: number;
  remainingItems: number;
}
export interface NewsDataModel {
  id: number; 
}

export interface NewsLanguageModel {
  file: string;
  title: string;
  subtitle: string;
  description: string;
  language: LanguageEnum;
}

export interface NewsLanguageModelToUpdate {
  title: string;
  language: LanguageEnum;
  created_at: Date;
}

export interface FormData {
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image: File | string | null;
  video: File | string | null;
  imageName: string;
  videoName: string;
  fileError: string;
  titleError: string;
  subtitleError: string;
  descriptionError: string;
}

export interface FormDataSet {
  [key: string]: FormData;
}
