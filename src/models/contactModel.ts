import type { LanguageEnum } from "./languageEnum";

export interface ContactModel {
  id: number;
  count: number;
  items: ContactDataModel[];
  page: number;
  page_limit: number;
  remainingitems: number;
}

export interface ContactDataModel {
  id: number;
}

export interface ContactLanguageModel {
  location: string;
  email: string;
  phoneNumber1: string;
  phoneNumber2: string;
  language: LanguageEnum;
}

export interface ContactLanguageModelToUpdate {
  location: string;
  email: string;
  phoneNumber1: string;
  phoneNumber2: string;
  language: LanguageEnum;
}

export interface FormData {
  location: string | null;
  locationError: string;
  email: string | null;
  emailError: string;
  phoneNumber1: string | null;
  phoneNumber1Error: string;
  phoneNumber2: string | null;
  phoneNumber2Error: string;
}

export interface FormDataSet {
  [key: string]: FormData;
}

export interface LanguageObject {
  location: string;
  email: string;
  phoneNumber1: string;
  phoneNumber2: string;
  language: LanguageEnum;
}
