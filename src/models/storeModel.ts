export interface StoreModel {
  id: number;
  count: number;
  items: StoreDataModel[];
  page: number;
  page_limit: number;
  remainingItems: number;
}
export interface StoreDataModel {
  id: number;
  company_name: string;
  amount: number;
  lot_number: number;
  item_name: string;
  registered_date: Date;
  expiration_date: Date;
}
