import type { LanguageEnum } from "./languageEnum";

export interface AdvertisementModel {
  id: number;
  count: number;
  items: AdvertisementDataModel[];
  page: number;
  page_limit: number;
  remainingitems: number;
}
export interface AdvertisementDataModel {
  id: number;
  created_at: Date;
  start_date: Date;
  end_date: Date;
  advertisementtranslation: AdvertisementLanguageModel[];
}

export interface AdvertisementLanguageModel {
  id: number;
  advertisement_id: number;
  image: string;
  language: LanguageEnum;
  created_at: Date;
}

export interface AdvertisementDataModelToUpdate {
  id: number;
  start_date: Date;
  end_date: Date;
}

export interface AdvertisementLanguageModelToUpdate {
  image: string;
  language: LanguageEnum;
  created_at: Date;
}
