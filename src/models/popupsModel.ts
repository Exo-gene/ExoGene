import type { LanguageEnum } from "./languageEnum";

export interface PopupsModel {
  id: number;
  count: number;
  items: PopupsDataModel[];
  page: number;
  page_limit: number;
  remainingitems: number;
}
export interface PopupsDataModel {
  id: number;
  created_at: Date;
  start_date: Date;
  end_date: Date;
  link: string;
  popupstranslation: PopupsLanguageModel[];
}

export interface PopupsLanguageModel {
  id: number;
  popup_id: number;
  title: string;
  image: string;
  description: string;
  language: LanguageEnum;
  created_at: Date;
}

export interface PopupsDataModelToUpdate {
  id: number;
  start_date: string;
  end_date: string;
  link: string;
  news_id: number;
}

export interface PopupsLanguageModelToUpdate {
  title: string;
  description: string;
  image: string;
  language: LanguageEnum;
}

export interface FormData {
  image: File | string | null;
  imageName: string;
  imageError: string;
  title: string;
  titleError: string;
  description: string;
  descriptionError: string;
  news_id: number | null;
  existingImageUrl: string | null;
}

export interface FormDataSet {
  [key: string]: FormData;
}
