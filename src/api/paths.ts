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
  personalData: (pod: string) =>
    `${pod}${BASE_APP_CONTAINER}/${PERSONAL_DATA}/`,
  inbox: (pod: string) => `${pod}${BASE_APP_CONTAINER}/${INBOX_CONTAINER}/`,
  team: {
    root: (pod: string) => `${pod}${BASE_APP_CONTAINER}/team/`,
  },
  accessHistory: (pod: string) =>
    `${pod}${BASE_APP_CONTAINER}/${ACCESS_HISTORY_CONTAINER}/`,
  footballData: (pod: string) =>
    `${pod}${BASE_APP_CONTAINER}/${FOOTBALL_DATA}/`,
  eventData: (pod: string) => `${pod}${BASE_APP_CONTAINER}/${EVENT_DATA}/`,
  trackingData: (pod: string) =>
    `${pod}${BASE_APP_CONTAINER}/${TRACKING_DATA}/`,
  biometricData: (pod: string) =>
    `${pod}${BASE_APP_CONTAINER}/${BIOMETRIC_DATA}/`,
  healthData: (pod: string) => `${pod}${BASE_APP_CONTAINER}/${HEALTH_DATA}/`,
};
