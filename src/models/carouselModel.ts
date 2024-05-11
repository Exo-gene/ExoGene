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
  start_date: Date;
  end_date: Date;
  carousel_translations: CarouselLanguageModel[];
}

export interface CarouselLanguageModelToUpdate {
  image: string;
  language: LanguageEnum;
}
