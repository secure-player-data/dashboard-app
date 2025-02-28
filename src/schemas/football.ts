export const FOOTBALL_DATA_SCHEMA = {
  type: 'https://schema.org/FootballMatch',
  homeTeam: 'https://schema.org/homeTeam',
  awayTeam: 'https://schema.org/awayTeam',
  homeScore: 'https://schema.org/homeScore',
  awayScore: 'https://schema.org/awayScore',
  date: 'https://schema.org/date',
  playTime: 'https://schema.org/playTime',
  position: 'https://schema.org/position',
};

export const FOOTBALL_AGGREGATION_SCHEMA = {
  type: 'https://schema.org/FootballAggregation',
  matches: 'https://schema.org/Matches',
  minutesPlayed: 'https://schema.org/MinutesPlayed',
};

export const SEASON_INFO_SCHEMA = {
  type: 'https://schema.org/FootballSeasonInfo',
  season: 'https://schema.org/Season',
  team: 'https://schema.org/Team',
  league: 'https://schema.org/League',
};
