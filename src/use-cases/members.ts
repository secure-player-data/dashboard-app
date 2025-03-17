import { fetchMember } from '@/api/member';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useQuery } from '@tanstack/react-query';

const queryKeys = {
  member: (pod: string) => ['member', pod],
};

export function useGetMember(session: Session | null, pod: string | null) {
  return useQuery({
    queryKey: queryKeys.member(pod!),
    queryFn: async () => fetchMember(session, pod),
    enabled: !!session && !!pod,
  });
}
