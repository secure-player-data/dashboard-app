import {
  fetchAggregatedFootballData,
  fetchSeasonInfo,
} from '@/api/data/football-data';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useQuery } from '@tanstack/react-query';

const queryKeys = {
  aggregatedFootballData: (pod: string, season?: string) => [
    'aggregated-football-data',
    pod,
    season,
  ],
  seasonInfo: (pod: string, season: string) => ['season-info', pod, season],
};

export function useGetAggregatedFootballData(
  session: Session | null,
  pod: string | null,
  type: 'club' | 'nation',
  season?: string
) {
  return useQuery({
    queryKey: queryKeys.aggregatedFootballData(pod!, season),
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
    queryKey: queryKeys.seasonInfo(pod!, season),
    queryFn: () => fetchSeasonInfo({ session, pod, type, season }),
    enabled: !!session && !!pod,
  });
}
