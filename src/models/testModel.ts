export interface TestModel {
  id: number;
  count: number;
  items: TestDataModel[];
  page: number;
  page_limit: number;
  remainingItems: number;
}
export interface TestDataModel {
  id: number;
  name: string;
  price: string;
}
