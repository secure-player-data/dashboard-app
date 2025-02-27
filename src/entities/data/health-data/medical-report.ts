export type MedicalReport = {
  date: Date;
  description: string;
  diagnoses: string;
  doctor: string; // Name or ID of the doctor who wrote the report
};
