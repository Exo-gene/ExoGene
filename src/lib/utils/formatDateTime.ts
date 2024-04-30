// Function to format date to display only date and time with AM/PM
// This function formats a datetime string to display date and time with AM/PM
export function formatDateTime(dateTimeString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  };
  return new Date(dateTimeString).toLocaleString(undefined, options);
}
