import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { fetchProfileData } from '@/api/profile';
import { Session } from '@inrupt/solid-client-authn-browser';

export function useGetProfile(session: Session | null, pod: string | null) {
  return useQuery({
    queryKey: queryKeys.profile(session?.info.webId ?? ''),
    queryFn: () => fetchProfileData(session, pod),
    enabled: !!session?.info.webId && !!pod,
  });
}
