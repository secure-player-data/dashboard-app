import { fetchAggregatedEventData } from '@/api/data/event-data';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useQuery } from '@tanstack/react-query';

const queryKeys = {
  aggregatedEventData: (pod: string, season?: string) => [
    'aggregated-event-data',
    pod,
    season,
  ],
};

export function useGetAggregatedEventData(
  session: Session | null,
  pod: string | null,
  type: 'club' | 'nation',
  season?: string
) {
  return useQuery({
    queryKey: queryKeys.aggregatedEventData(pod!, season),
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
