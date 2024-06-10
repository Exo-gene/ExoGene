import type { LanguageEnum } from "./languageEnum";

export interface MagazineModel {
  id: number;
  count: number;
  items: MagazineDataModel[];
  page: number;
  page_limit: number;
  remainingitems: number;
}

export interface MagazineLanguageModel {
  id: number;
  number: number;
  date: Date;
  magazine_id: number;
  pdfFile: string;
  language: LanguageEnum;
}

export interface MagazineLanguageModelToUpdate {
  pdfFile: string;
  language: LanguageEnum;
  number: number;
  date: Date;
}
export interface MagazineDataModel {
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
