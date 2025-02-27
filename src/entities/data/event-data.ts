// Represents an event that occurred in a football match
// The event is related to the player that has the event
// stored in their pod
export type EventData = {
  event: string; // e.g. goal, assist, yellow card, red card, etc.
  time: number; // minute of the match
  notes: string;
};
