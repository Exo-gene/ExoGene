import type { LanguageEnum } from "./languageEnum";

export interface EventModel {
  id: number;
  count: number;
  items: EventDataModel[];
  page: number;
  page_limit: number;
  remainingitems: number;
}

export interface EventDataModel {
  id: number;
  start_date: Date | string;
  end_date: Date | string;
  repeat_annually: boolean;
}

export interface EventLanguageModel {
  title: string;
  language: LanguageEnum;
}

export interface EventLanguageModelToUpdate {
  title: string;
  language: LanguageEnum;
}

export interface FormData {
  title: string | null;
  titleError: string;
  descriptionError: string;
  description: string | null;
}

export interface FormDataSet {
  [key: string]: FormData;
}

export interface LanguageObject {
  title: string;
  language: LanguageEnum;
}
