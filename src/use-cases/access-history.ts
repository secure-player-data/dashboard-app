import { fetchAccessHistory } from '@/api/access-history';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useQuery } from '@tanstack/react-query';

export const queryKeys = {
  getAll: (pod: string, limit: number, page: number) => [
    'access-history',
    pod,
    limit,
    page,
  ],
};

export function useGetAccessHistory(
  session: Session | null,
  pod: string | null,
  limit: number = 25,
  page: number = 1
) {
  return useQuery({
    queryKey: queryKeys.getAll(pod!, limit, page),
    queryFn: () => fetchAccessHistory(session, pod, limit, page),
    enabled: !!session && !!pod,
  });
}
