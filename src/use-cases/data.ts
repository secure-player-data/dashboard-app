import { fetchDataByCategory, fetchFile } from '@/api/data';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useQuery } from '@tanstack/react-query';

const queryKeys = {
  allData: (pod: string, category: string) => ['data', pod, category],
  file: (url: string) => ['file', url],
};

export function useGetData(
  session: Session | null,
  pod: string | null,
  category: string
) {
  return useQuery({
    queryKey: queryKeys.allData(pod!, category),
    queryFn: async () => await fetchDataByCategory(session, pod, category),
    enabled: !!session || !!pod,
  });
}

export function useGetFile(session: Session | null, url: string) {
  return useQuery({
    queryKey: queryKeys.file(url),
    queryFn: async () => await fetchFile(session, url),
  });
}
