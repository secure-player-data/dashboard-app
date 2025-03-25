import {
  fetchAllMatchesForSeasonWithTracking,
  fetchAllSeasonsWithTracking,
  fetchTrackingData,
} from '@/api/deprecated/tracking-data';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useQuery } from '@tanstack/react-query';

const queryKeys = {
  seasons: (pod: string, type: string) => ['tracking', 'seasons', pod, type],
  matches: (season: string) => ['tracking', 'matches', season],
  match: (session: string) => ['tracking', 'match', session],
};

/**
 * Returns a list of all seasons with tracking data
 * @param sessionType match or training
 */
export function useGetAllSeasonsWithTracking(
  session: Session | null,
  pod: string | null,
  sessionType: string
) {
  return useQuery({
    queryKey: queryKeys.seasons(pod!, sessionType),
    queryFn: () => fetchAllSeasonsWithTracking(session, pod, sessionType),
    enabled: !!session && !!pod && sessionType !== '',
  });
}

/**
 * Returns a list of all matches for a season with tracking data
 * @param season url of the season folder
 */
export function useGetAllMatchesForSeasonWithTracking(
  session: Session | null,
  season: string
) {
  return useQuery({
    queryKey: queryKeys.matches(season),
    queryFn: () => fetchAllMatchesForSeasonWithTracking(session, season),
    enabled: !!session && season !== '',
  });
}

/**
 * Returns the tracking data for a session
 * @param sessionUrl url of the session resource (match or training)
 * @returns
 */
export function useGetTrackingData(
  session: Session | null,
  sessionUrl: string
) {
  return useQuery({
    queryKey: queryKeys.match(sessionUrl),
    queryFn: () => fetchTrackingData(session, sessionUrl),
    enabled: !!session && sessionUrl !== '',
  });
}
