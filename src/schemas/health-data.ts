export const INJURY_SCHEMA = {
  type: 'https://schema.org/Injury',
  injuryType: 'https://schema.org/injuryType',
  description: 'https://schema.org/description',
  location: 'https://schema.org/location',
  date: 'https://schema.org/date',
  severity: 'https://schema.org/severity',
  recoveryTime: 'https://schema.org/recoveryTime',
  treatment: 'https://schema.org/treatment',
  rehabilitationPlan: 'https://schema.org/rehabilitationPlan',
};

export const MEDICAL_REPORT_METADATA_SCHEMA = {
  type: 'https://schema.org/MedicalReport',
  title: 'https://schema.org/title',
  date: 'https://schema.org/date',
  doctor: 'https://schema.org/doctor',
  category: 'https://schema.org/category',
};

export const MEDICAL_REPORT_CONTENT_SCHEMA = {
  type: 'https://schema.org/MedicalReportContent',
  title: 'https://schema.org/title',
  content: 'https://schema.org/content',
};
