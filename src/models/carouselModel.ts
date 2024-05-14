import type { LanguageEnum } from "./languageEnum";

export interface CarouselModel {
  id: number;
  count: number;
  items: CarouselDataModel[];
  page: number;
  page_limit: number;
  remainingitems: number;
}
export interface CarouselDataModel {
  id: number;
  created_at: Date;
  start_date: Date;
  end_date: Date;
  carouseltranslation: CarouselLanguageModel[];
}

export interface CarouselLanguageModel {
  id: number;
  title: string;
  carousel_id: number;
  image: string;
  language: LanguageEnum;
  created_at: Date;
}

export interface CarouselDataModelToUpdate {
  id: number;
  news_id: number;
}

export interface CarouselLanguageModelToUpdate {
  image: string;
  language: LanguageEnum;
}

export interface FormData {
  image: File | string | null;
  imageName: string;
  imageError: string;
  titleError: string;
  descriptionError: string;
  news_id: number |null;
  title: string;
  description: string;
}

export interface FormDataSet {
  [key: string]: FormData;
}
