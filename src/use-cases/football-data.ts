import {
  fetchAggregatedFootballData,
  fetchAllSeasonInfo,
  fetchSeasonInfo,
} from '@/api/data/football-data';
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
