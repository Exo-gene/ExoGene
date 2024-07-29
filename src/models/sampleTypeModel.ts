export interface SampleTypeModel {
  id: number;
  count: number;
  items: SampleTypeDataModel[];
  page: number;
  page_limit: number;
  remainingItems: number;
}
export interface SampleTypeDataModel {
  id: number;
  name: string;
}
