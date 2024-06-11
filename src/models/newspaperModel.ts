import type { LanguageEnum } from "./languageEnum";

export interface NewspaperModel {
  id: number;
  count: number;
  items: NewspaperDataModel[];
  page: number;
  page_limit: number;
  remainingitems: number;
}

export interface NewspaperLanguageModel {
  id: number;
  number: number;
  date: Date;
  newspaper_id: number;
  pdfFile: string;
  language: LanguageEnum;
}

export interface NewspaperLanguageModelToUpdate {
  pdfFile: string;
  language: LanguageEnum;
  number: number;
  date: Date;
}
export interface NewspaperDataModel {
  id: number;
}

export interface FormData {
  pdfFile: File | string | null;
  pdfFileName?: string;
  pdfFileError: string;
  numberError: string;
  number?: number;
  date?: string;
  dateError: string;
}

export interface FormDataSet {
  [key: string]: FormData;
}
