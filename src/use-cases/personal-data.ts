import { fetchPersonalData } from '@/api/deprecated/personal-data';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useQuery } from '@tanstack/react-query';

export const queryKeys = {
  peronalData: (pod: string) => ['personal-data', pod],
};

export function useGetPersonalData(
  session: Session | null,
  pod: string | null
) {
  return useQuery({
    queryKey: queryKeys.peronalData(pod ?? ''),
    queryFn: () => fetchPersonalData(session, pod),
    enabled: !!session?.info.webId && !!pod,
  });
}
