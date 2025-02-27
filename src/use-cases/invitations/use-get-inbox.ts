import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import { Session } from '@inrupt/solid-client-authn-browser';
import { fetchInbox } from '@/api/inbox';

export function useGetInbox(session: Session | null, pod: string | null) {
  return useQuery({
    queryKey: queryKeys.inbox(session?.info.webId ?? ''),
    queryFn: () => fetchInbox(session, pod),
    enabled: !!session && !!pod,
  });
}
