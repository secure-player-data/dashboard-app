export type Injury = {
  type: string;
  description: string;
  location: string;
  date: Date;
  severity: string;
  recoveryTime: string;
  treatment: string;
  rehabilitationPlan: string;
};

export type MedicalReport = {
  title: string;
  date: Date;
  doctor: string;
  category: string;
  content: {
    title: string;
    text: string;
  }[];
};
