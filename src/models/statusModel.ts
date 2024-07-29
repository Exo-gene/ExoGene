export interface StatusModel {
  id: number;
  count: number;
  items: StatusDataModel[];
  page: number;
  page_limit: number;
  remainingItems: number;
}
export interface StatusDataModel {
  id: number;
  name: string; 
}
