import type { LanguageEnum } from "./languageEnum";
import type { PositionEnum } from "./positionEnum";

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
  start_date: string;
  end_date: string;
  position: PositionEnum;
  category_id: number;
}

export interface AdvertisementLanguageModelToUpdate {
  file: string;
  language: LanguageEnum; 
}

export interface FormData {
  image: File | string | null;
  video: File | string | null;
  imageName: string;
  videoName: string;
  fileError: string;
  category_id: number | null;
}

export interface FormDataSet {
  [key: string]: FormData;
}
