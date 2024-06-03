import moment from "moment";

export function toUtc(date: any) {
  const momentDate = moment.isMoment(date) ? date : moment(date);
  return momentDate.utc().format("YYYY-MM-DDTHH:mm:ss") + "Z";
}

export function toLocaleDate(date: any) {
  return moment.utc(date).local().format("YYYY-MM-DD");
}
export function toLocaleDateFormat(date: any) {
  return moment.utc(date).local().format("YYYY-MM-DD HH:mm:ss");
}

export function convertRawDateToUtc(date: any) {
  const rawDate = moment(date, "DD/MM/YYYY HH:mm:ss").format("");
  return moment.utc(rawDate).format("") as any;
}
export function toLocaleTimeOnly(time: any) {
  return moment.utc(time, "HH:mm:ss").local().format("HH:mm:ss");
}
export function toUtcTimeOnly(time: any) {
  return moment.utc(moment(time, "HH:mm:ss").format("")).format("HH:mm:ss");
}
