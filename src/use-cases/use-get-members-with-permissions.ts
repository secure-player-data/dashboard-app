import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { Session } from '@inrupt/solid-client-authn-browser';
import { fetchMembersWithPermissions } from '@/api/member';

export function useGetMembersWithPermissions(
  session: Session | null,
  pod: string | null
) {
  return useQuery({
    queryKey: queryKeys.members.withPermissions(session?.info.webId ?? ''),
    queryFn: () => fetchMembersWithPermissions(session, pod),
    enabled: !!session && !!pod,
  });
}
