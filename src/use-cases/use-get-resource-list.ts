import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { Session } from '@inrupt/solid-client-authn-browser';
import { getResourceList } from '@/api/access-control/index';

export function useGetResourceList(
  session: Session | null,
  pod: string | null
) {
  return useQuery({
    queryKey: queryKeys.accessControl.resourceList(session?.info.webId ?? ''),
    queryFn: () => getResourceList(session, pod),
    enabled: !!session && !!pod,
  });
}
