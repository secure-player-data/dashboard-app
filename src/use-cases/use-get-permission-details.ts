import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { Session } from '@inrupt/solid-client-authn-browser';
import { getPermissionDetails } from '@/api/access-control/utils';

export function useGetPermissionDetails(
  session: Session | null,
  resourcePath: string | null
) {
  return useQuery({
    queryKey: queryKeys.accessControl.permissionDetails(
      session?.info.webId ?? '',
      resourcePath ?? ''
    ),
    queryFn: () => getPermissionDetails(session, resourcePath),
    enabled: !!session && !!resourcePath,
  });
}
