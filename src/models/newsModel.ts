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

enum LanguageEnum {
  EN = "en",
  AR = "ar",
  CKB = "ckb",
}

export interface FormData {
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image: File | null;
  video: File | null;
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
