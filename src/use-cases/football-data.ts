import {
  fetchAggregatedFootballData,
  fetchAllMatchesBySeason,
  fetchAllSeasonInfo,
  fetchMatchData,
  fetchSeasonInfo,
} from '@/api/deprecated/football-data';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useQuery } from '@tanstack/react-query';

const queryKeys = {
  aggregatedFootballData: (pod: string, type: string, season?: string) => [
    'aggregated-football-data',
    pod,
    type,
    season,
  ],
  seasonInfo: (pod: string, type: string, season: string) => [
    'season-info',
    pod,
    type,
    season,
  ],
  allSeasonInfo: (pod: string, type: string) => ['all-season-info', pod, type],
  allMatches: (pod: string, type: string, season: string) => [
    'all-matches',
    pod,
    type,
    season,
  ],
  match: (url: string) => ['match', url],
};

export function useGetAggregatedFootballData(
  session: Session | null,
  pod: string | null,
  type: 'club' | 'nation',
  season?: string
) {
  return useQuery({
    queryKey: queryKeys.aggregatedFootballData(pod!, type, season),
    queryFn: () =>
      fetchAggregatedFootballData({
        session,
        pod,
        type,
        season,
      }),
    enabled: !!session && !!pod,
  });
}

export function useGetSeasonInfo(
  session: Session | null,
  pod: string | null,
  type: 'club' | 'nation',
  season: string
) {
  return useQuery({
    queryKey: queryKeys.seasonInfo(pod!, type, season),
    queryFn: () => fetchSeasonInfo({ session, pod, type, season }),
    enabled: !!session && !!pod,
  });
}

export function useGetAllSeasonsInfo(
  session: Session | null,
  pod: string | null,
  type: 'club' | 'nation'
) {
  return useQuery({
    queryKey: queryKeys.allSeasonInfo(pod!, type),
    queryFn: () => fetchAllSeasonInfo({ session, pod, type }),
    enabled: !!session && !!pod,
  });
}

export function useGetAllMatchesBySeason(
  session: Session | null,
  pod: string | null,
  type: 'club' | 'nation',
  season: string
) {
  return useQuery({
    queryKey: queryKeys.allMatches(pod!, type, season),
    queryFn: () => fetchAllMatchesBySeason({ session, pod, type, season }),
    enabled: !!session && !!pod,
  });
}

export function useGetMatchData(session: Session | null, url: string) {
  return useQuery({
    queryKey: queryKeys.match(url),
    queryFn: () => fetchMatchData({ session, url }),
    enabled: !!session,
  });
}
