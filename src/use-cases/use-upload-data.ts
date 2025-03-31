import { Session } from '@inrupt/solid-client-authn-browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { uploadPlayerData } from '@/api/upload-data';

export function useUploadData(session: Session | null, pod: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      session,
      uploadedFile,
      senderPod,
      uploader,
      reason,
      location,
      category,
      receiverPod,
    }: {
      session: Session | null;
      uploadedFile: File[];
      senderPod: string;
      uploader: { webId: string; name: string };
      reason: string;
      location: string;
      category: string;
      receiverPod: string;
    }) =>
      uploadPlayerData(
        session,
        uploadedFile,
        senderPod,
        uploader,
        reason,
        location,
        category,
        receiverPod
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.uploadPlayerData(session?.info.webId!),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.uploadPlayerData(session?.info.webId!),
      });
    },
  });
}
