// Represents a biometric data entry of a player in a match or training session
export type BiometricData = {
  type: string; // e.g. heart rate, body temperature, etc.
  value: string;
  time: number;
};
