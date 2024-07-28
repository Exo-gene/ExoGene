import type { LanguageEnum } from "./languageEnum";
import type { PositionEnum } from "./positionEnum";

export interface labModel {
  id: number;
  count: number;
  page: number;
  page_limit: number;
  remainingitems: number;
}
