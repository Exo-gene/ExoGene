export interface PatientRegistrationModel {
  id: number;
  count: number;
  items: PatientRegistrationDataModel[];
  page: number;
  page_limit: number;
  remainingItems: number;
  status: string;
}
export interface PatientRegistrationDataModel {
  id: number;
  name: string;
  address: string;
  phonenumber: string;
  gender: string;
  birth_date: string;
  created_at: string;
}
