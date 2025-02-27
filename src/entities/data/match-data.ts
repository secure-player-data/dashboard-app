// Represents the data of a football match for a player
export type MatchData = {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  date: Date;
  playTime: string; // How long the player played
  playerPosition: string; // Where the player played in the match
};
