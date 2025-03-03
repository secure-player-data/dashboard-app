// Represents the data of a football match for a player
export type FootballData = {
  url: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  date: Date;
  location: string;
  playTime: number; // How long the player played
  playerPosition: string; // Where the player played in the match
};

export type FootballAggregation = {
  matches: number;
  minutesPlayed: number;
};

export type SeasonInfo = {
  season: string;
  team: string;
  league: string;
};
