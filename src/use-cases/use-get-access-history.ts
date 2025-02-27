import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { Session } from '@inrupt/solid-client-authn-browser';
import { fetchAccessHistory } from '@/api/access-history';

export function useGetAccessHistory(
  session: Session | null,
  pod: string | null
) {
  return useQuery({
    queryKey: queryKeys.accessHistory(session?.info.webId!),
    queryFn: () => fetchAccessHistory(session, pod),
    enabled: !!session && !!pod,
  });
}
