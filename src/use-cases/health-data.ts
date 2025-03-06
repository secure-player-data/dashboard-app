import { fetchInjuries } from '@/api/data/health-data';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useQuery } from '@tanstack/react-query';

const queryKeys = {
  injuries: (player: string) => ['injuries', player],
};

export function useGetInjuries(session: Session | null, player: string) {
  return useQuery({
    queryKey: queryKeys.injuries(player),
    queryFn: () => fetchInjuries(session, player),
    enabled: !!session,
  });
}
