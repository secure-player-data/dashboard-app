import { usesAcp } from '@/api/access-control';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useQuery } from '@tanstack/react-query';

const queryKeys = {
  policy: (pod: string) => ['access-policy', pod],
};

export function useGetAccessPolicy(
  session: Session | null,
  pod: string | null
) {
  return useQuery({
    queryKey: queryKeys.policy(pod!),
    queryFn: async () => usesAcp(session!, pod!),
    enabled: !!session && !!pod,
  });
}
