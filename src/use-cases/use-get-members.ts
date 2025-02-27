import { Session } from '@inrupt/solid-client-authn-browser';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { fetchMembers } from '@/api/member';

export function useGetMembers(session: Session | null, pod: string | null) {
  return useQuery({
    queryKey: queryKeys.members.default(session?.info.webId!),
    queryFn: () => fetchMembers(session, pod),
    enabled: !!session && !!pod,
  });
}
