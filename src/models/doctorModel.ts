export interface DoctorModel {
  id: number;
  count: number;
  items: DoctorDataModel[];
  page: number;
  page_limit: number;
  remainingItems: number;
}
export interface DoctorDataModel {
  id: number;
  name: string;
  phonenumber: string;
}
