export interface LabModel {
  id: number;
  count: number;
  items: LabDataModel[];
  page: number;
  page_limit: number;
  remainingItems: number;
}
export interface LabDataModel {
  id: number;
  name: string;
  address: string;
}
