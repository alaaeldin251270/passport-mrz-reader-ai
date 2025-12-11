export interface PassportData {
  surname: string;
  givenNames: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string; // Format YYYY-MM-DD from API
  sex: string; // M or F
  dateOfExpiry: string; // Format YYYY-MM-DD from API
  issuingCountry: string;
}

export interface FormattedResult {
  line1: string;
  line2: string;
}