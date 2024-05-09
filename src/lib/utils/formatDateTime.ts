import moment from "moment";

// Function to convert UTC date to local date and format it
export function formatDateTime(dateTimeString: string): string {
  const localDate = moment.utc(dateTimeString).local();
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  };
  return localDate.toDate().toLocaleString(undefined, options);
}
 