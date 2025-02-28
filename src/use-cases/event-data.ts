import { fetchAggregatedEventData } from '@/api/data/event-data';
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
