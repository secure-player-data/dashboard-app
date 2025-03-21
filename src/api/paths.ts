export const DATA_CONTAINER = 'data';

export const BASE_APP_CONTAINER = 'secure-player-data';
export const PERSONAL_DATA = 'personal-data';
export const FOOTBALL_DATA = 'football-data';
export const EVENT_DATA = 'event-data';
export const TRACKING_DATA = 'tracking-data';
export const BIOMETRIC_DATA = 'biometric-data';
export const HEALTH_DATA = 'health-data';

export const INBOX_CONTAINER = 'inbox';
export const ACCESS_HISTORY_CONTAINER = 'access-history';

export const paths = {
  root: (pod: string) => `${pod}${BASE_APP_CONTAINER}/`,
  profile: (pod: string) => `${pod}${BASE_APP_CONTAINER}/Profile`,
  personalData: (pod: string) => `${pod}${BASE_APP_CONTAINER}/${PERSONAL_DATA}`,
  inbox: (pod: string) => `${pod}${BASE_APP_CONTAINER}/${INBOX_CONTAINER}/`,
  team: {
    root: (pod: string) => `${pod}${BASE_APP_CONTAINER}/team/`,
  },
  accessHistory: (pod: string) =>
    `${pod}${BASE_APP_CONTAINER}/${ACCESS_HISTORY_CONTAINER}/`,
  footballData: {
    root: (pod: string) => `${pod}${BASE_APP_CONTAINER}/${FOOTBALL_DATA}`,
    club: {
      root: (pod: string) =>
        `${pod}${BASE_APP_CONTAINER}/${FOOTBALL_DATA}/club-data`,
      aggregation: (pod: string) =>
        `${pod}${BASE_APP_CONTAINER}/${FOOTBALL_DATA}/club-data/aggregation`,
      season: {
        root: (pod: string, season: string) =>
          `${pod}${BASE_APP_CONTAINER}/${FOOTBALL_DATA}/club-data/${season}`,
        aggregation: (pod: string, season: string) =>
          `${pod}${BASE_APP_CONTAINER}/${FOOTBALL_DATA}/club-data/${season}/aggregation`,
        info: (pod: string, season: string) =>
          `${pod}${BASE_APP_CONTAINER}/${FOOTBALL_DATA}/club-data/${season}/info`,
        match: (pod: string, season: string, match: string) =>
          `${pod}${BASE_APP_CONTAINER}/${FOOTBALL_DATA}/club-data/${season}/${match}`,
      },
    },
    national: {
      root: (pod: string) =>
        `${pod}${BASE_APP_CONTAINER}/${FOOTBALL_DATA}/national-data`,
      aggregation: (pod: string) =>
        `${pod}${BASE_APP_CONTAINER}/${FOOTBALL_DATA}/national-data/aggregation`,
      season: {
        root: (pod: string, season: string) =>
          `${pod}${BASE_APP_CONTAINER}/${FOOTBALL_DATA}/national-data/${season}`,
        aggregation: (pod: string, season: string) =>
          `${pod}${BASE_APP_CONTAINER}/${FOOTBALL_DATA}/national-data/${season}/aggregation`,
        info: (pod: string, season: string) =>
          `${pod}${BASE_APP_CONTAINER}/${FOOTBALL_DATA}/national-data/${season}/info`,
        match: (pod: string, season: string, match: string) =>
          `${pod}${BASE_APP_CONTAINER}/${FOOTBALL_DATA}/national-data/${season}/${match}`,
      },
    },
  },
  eventData: {
    root: (pod: string) => `${pod}${BASE_APP_CONTAINER}/event-data`,
    club: {
      root: (pod: string) =>
        `${pod}${BASE_APP_CONTAINER}/${EVENT_DATA}/club-data`,
      aggregation: (pod: string) =>
        `${pod}${BASE_APP_CONTAINER}/${EVENT_DATA}/club-data/aggregation`,
      season: {
        root: (pod: string, season: string) =>
          `${pod}${BASE_APP_CONTAINER}/${EVENT_DATA}/club-data/${season}`,
        aggregation: (pod: string, season: string) =>
          `${pod}${BASE_APP_CONTAINER}/${EVENT_DATA}/club-data/${season}/aggregation`,
        match: (pod: string, season: string, match: string) =>
          `${pod}${BASE_APP_CONTAINER}/${EVENT_DATA}/club-data/${season}/${match}`,
      },
    },
    national: {
      root: (pod: string) =>
        `${pod}${BASE_APP_CONTAINER}/${EVENT_DATA}/national-data`,
      aggregation: (pod: string) =>
        `${pod}${BASE_APP_CONTAINER}/${EVENT_DATA}/national-data/aggregation`,
      season: {
        root: (pod: string, season: string) =>
          `${pod}${BASE_APP_CONTAINER}/${EVENT_DATA}/national-data/${season}`,
        aggregation: (pod: string, season: string) =>
          `${pod}${BASE_APP_CONTAINER}/${EVENT_DATA}/national-data/${season}/aggregation`,
        match: (pod: string, season: string, match: string) =>
          `${pod}${BASE_APP_CONTAINER}/${EVENT_DATA}/national-data/${season}/${match}`,
      },
    },
  },
  trackingData: {
    root: (pod: string) => `${pod}${BASE_APP_CONTAINER}/tracking-data`,
    matches: {
      root: (pod: string) =>
        `${pod}${BASE_APP_CONTAINER}/${TRACKING_DATA}/matches`,
      season: (pod: string, season: string) =>
        `${pod}${BASE_APP_CONTAINER}/${TRACKING_DATA}/matches/${season}`,
      match: (pod: string, season: string, match: string) =>
        `${pod}${BASE_APP_CONTAINER}/${TRACKING_DATA}/matches/${season}/${match}`,
    },
    training: {
      root: (pod: string) =>
        `${pod}${BASE_APP_CONTAINER}/${TRACKING_DATA}/training`,
      season: (pod: string, season: string) =>
        `${pod}${BASE_APP_CONTAINER}/${TRACKING_DATA}/training/${season}`,
      session: (pod: string, season: string, session: string) =>
        `${pod}${BASE_APP_CONTAINER}/${TRACKING_DATA}/training/${season}/${session}`,
    },
  },
  biometricData: {
    root: (pod: string) => `${pod}${BASE_APP_CONTAINER}/biometric-data`,
    matches: {
      root: (pod: string) =>
        `${pod}${BASE_APP_CONTAINER}/${BIOMETRIC_DATA}/matches`,
      season: (pod: string, season: string) =>
        `${pod}${BASE_APP_CONTAINER}/${BIOMETRIC_DATA}/matches/${season}`,
      match: (pod: string, season: string, match: string) =>
        `${pod}${BASE_APP_CONTAINER}/${BIOMETRIC_DATA}/matches/${season}/${match}`,
    },
    training: {
      root: (pod: string) =>
        `${pod}${BASE_APP_CONTAINER}/${BIOMETRIC_DATA}/training`,
      season: (pod: string, season: string) =>
        `${pod}${BASE_APP_CONTAINER}/${BIOMETRIC_DATA}/training/${season}`,
      session: (pod: string, season: string, session: string) =>
        `${pod}${BASE_APP_CONTAINER}/${BIOMETRIC_DATA}/training/${season}/${session}`,
    },
  },
  healthData: {
    root: (pod: string) => `${pod}${BASE_APP_CONTAINER}/health-data`,
    injuries: {
      root: (pod: string) =>
        `${pod}${BASE_APP_CONTAINER}/${HEALTH_DATA}/injuries`,
      injury: (pod: string, injury: string) =>
        `${pod}${BASE_APP_CONTAINER}/${HEALTH_DATA}/injuries/${injury}`,
    },
    medicalReports: {
      root: (pod: string) =>
        `${pod}${BASE_APP_CONTAINER}/${HEALTH_DATA}/medical-reports`,
      report: (pod: string, report: string) =>
        `${pod}${BASE_APP_CONTAINER}/${HEALTH_DATA}/medical-reports/${report}`,
    },
    vaccinations: {
      root: (pod: string) =>
        `${pod}${BASE_APP_CONTAINER}/${HEALTH_DATA}/vaccinations`,
      vaccination: (pod: string, vaccination: string) =>
        `${pod}${BASE_APP_CONTAINER}/${HEALTH_DATA}/vaccinations/${vaccination}`,
    },
  },
};
