export const formatPassportDate = (dateString: string): string => {
  // Input expected: YYYY-MM-DD or similar standard format
  // We want Output: DDMMMYY (e.g., 20JAN25) without spaces or hyphens based on user request
  
  if (!dateString) return "UNKNOWN";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Return original if parse fails

  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year

  // Returns format like: 20JAN25
  return `${day}${month}${year}`;
};