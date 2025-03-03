// Represents the data of a football match for a player
export type FootballData = {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  date: Date;
  playTime: string; // How long the player played
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
