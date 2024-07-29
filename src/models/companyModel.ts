export interface CompanyModel {
  id: number;
  count: number;
  items: CompanyDataModel[];
  page: number;
  page_limit: number;
  remainingItems: number;
}
export interface CompanyDataModel {
  id: number;
  name: string;
  address: string;
}
