// Represents a tracking entry of a player in a match or training session
export type TrackingData = {
  coordinates: {
    x: number;
    y: number;
    z: number;
  };
  time: number;
  speed: number;
  notes: string;
};
