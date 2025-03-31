import {
  deleteData,
  fetchData,
  fetchDataByCategory,
  fetchDeletionRequests,
  fetchFile,
} from '@/api/data';
import {
  sendDataDeletionConfirmation,
  sendDataDeletionRequest,
} from '@/api/inbox';
import { DataInfo } from '@/entities/data-info';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys as inboxQueryKeys } from './invitations';
import { DataDeletionNotification } from '@/entities/inboxItem';

export const queryKeys = {
  allData: (pod: string, category: string) => ['data', pod, category],
  data: (url: string) => ['data', url],
  file: (url: string) => ['file', url],
  deletionRequests: (pod: string) => ['deletionRequests', pod],
};

export function useGetDataByCategory(
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

export function useGetData(session: Session | null, url: string) {
  return useQuery({
    queryKey: queryKeys.data(url),
    queryFn: async () => await fetchData(session, url),
    enabled: !!session,
  });
}

export function useGetFile(session: Session | null, url: string | undefined) {
  return useQuery({
    queryKey: queryKeys.file(url!),
    queryFn: async () => await fetchFile(session, url!),
    enabled: !!session && !!url,
  });
}

export function useSendDeletionRequest(
  session: Session | null,
  pod: string | null,
  category: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      sender,
    }: {
      data: DataInfo[];
      sender: { name: string; organization: string };
    }) => await sendDataDeletionRequest(session, pod, { data, sender }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.allData(pod!, category),
      });
    },
  });
}

export function useSendDeletionRequestAndDeleteData(
  session: Session | null,
  pod: string | null,
  category: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      sender,
    }: {
      data: DataInfo[];
      sender: { name: string; organization: string };
    }) => {
      await sendDataDeletionRequest(session, pod, {
        data: data.filter((d) => d.status === ''),
        sender,
      });
      await deleteData(session, pod, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.allData(pod!, category),
      });
    },
  });
}

export function useConfirmDataDeletion(
  session: Session | null,
  pod: string | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      notification,
      name,
    }: {
      notification: DataDeletionNotification;
      name: string;
    }) => sendDataDeletionConfirmation(session, pod, name, notification),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inboxQueryKeys.inbox(session?.info.webId ?? ''),
      });
    },
  });
}

export function useGetDeletionRequests(
  session: Session | null,
  pod: string | null
) {
  return useQuery({
    queryKey: queryKeys.deletionRequests(pod!),
    queryFn: async () => await fetchDeletionRequests(session, pod),
  });
}
