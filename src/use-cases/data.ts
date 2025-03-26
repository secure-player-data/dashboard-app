import { deleteData, fetchDataByCategory, fetchFile } from '@/api/data';
import { DataInfo } from '@/entities/data-info';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

export function useDeleteData(
  session: Session | null,
  pod: string | null,
  category: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      deleteFromPod,
    }: {
      data: DataInfo[];
      deleteFromPod?: boolean;
    }) => await deleteData(session, pod, data, deleteFromPod),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.allData(pod!, category),
      });
    },
  });
}
