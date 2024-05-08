import moment from "moment";

export function toUtc(date: Date) {
  return moment(date).utc().format();  
}
export function toLocale(date:any) {
  return moment.utc(date, "").local().format("DD/MM/YYYY HH:mm:ss");
}
// export function toLocaleDateFormat(date) {
//   return moment.utc(date, "").local().toDate();
// }
export function toLocaleDateFormat(date:any) {
  return moment.utc(date).local().format("YYYY-MM-DD HH:mm:ss");
}

export function convertRawDateToUtc(date:any) {
  const rawDate = moment(date, "DD/MM/YYYY HH:mm:ss").format("");
  return moment.utc(rawDate).format("") as any;
}
export function toLocaleTimeOnly(time:any) {
  return moment.utc(time, "HH:mm:ss").local().format("HH:mm:ss");
}
export function toUtcTimeOnly(time:any) {
  return moment.utc(moment(time, "HH:mm:ss").format("")).format("HH:mm:ss");
}
