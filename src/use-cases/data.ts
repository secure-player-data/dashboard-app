import { fetchData } from '@/api/utils';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useQuery } from '@tanstack/react-query';

const queryKeys = {
  getData: (pod: string, category: string) => ['data', pod, category],
};

export function useGetData(
  session: Session | null,
  pod: string | null,
  category: string
) {
  return useQuery({
    queryKey: queryKeys.getData(pod!, category),
    queryFn: async () => await fetchData(session, pod, category),
    enabled: !!session || !!pod,
  });
}
