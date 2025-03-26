import {
  fetchAggregatedEventData,
  fetchEventsForMatch,
} from '@/api/deprecated/event-data';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useQuery } from '@tanstack/react-query';

const queryKeys = {
  aggregatedEventData: (pod: string, type: string, season?: string) => [
    'aggregated-event-data',
    pod,
    type,
    season,
  ],
  allAggregatedData: (pod: string, type: string) => [
    'all-aggregated-event-data',
    pod,
    type,
  ],
  matchEvents: (pod: string, type: string, season: string, matchId: string) => [
    'match-events',
    pod,
    type,
    season,
    matchId,
  ],
};

export function useGetAggregatedEventData(
  session: Session | null,
  pod: string | null,
  type: 'club' | 'nation',
  season?: string
) {
  return useQuery({
    queryKey: queryKeys.aggregatedEventData(pod!, type, season),
    queryFn: () =>
      fetchAggregatedEventData({
        session,
        pod,
        type,
        season,
      }),
    enabled: !!session && !!pod,
  });
}

export function useGetEventsForMatch(
  session: Session | null,
  pod: string | null,
  type: 'club' | 'nation',
  season: string,
  matchId: string
) {
  return useQuery({
    queryKey: queryKeys.matchEvents(pod!, type, season, matchId),
    queryFn: () =>
      fetchEventsForMatch({
        session,
        pod,
        season,
        type,
        matchId,
      }),
    enabled: !!session && !!pod,
  });
}
