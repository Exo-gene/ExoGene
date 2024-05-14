import type { LanguageEnum } from "./languageEnum";

export interface TagModel {
  id: number;
  count: number;
  items: TagDataModel[];
  page: number;
  page_limit: number;
  remainingitems: number;
}

export interface TagDataModel {
  id: number; 
}

export interface TagLanguageModel {
  title: string;
  language: LanguageEnum;
}

export interface TagLanguageModelToUpdate {
  title: string;
  language: LanguageEnum; 
}

export interface FormData {
  title: string | null;
  titleError: string;
}

export interface FormDataSet {
  [key: string]: FormData;
}

 
  export interface LanguageObject {
    title: string;
    language: LanguageEnum;
  }



export interface TagId {
  tag_id: number;
}
