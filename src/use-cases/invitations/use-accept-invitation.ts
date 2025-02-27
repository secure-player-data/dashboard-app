import { useMutation, useQueryClient } from '@tanstack/react-query';
import { acceptInvitation } from '@/api/inbox';
import { Session } from '@inrupt/solid-client-authn-browser';
import { queryKeys } from '../query-keys';

export const useAcceptInvitation = (session: Session | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      receiverPod,
      senderPod,
      senderWebId,
      senderEmail,
      role,
      date,
      teamName,
    }: {
      receiverPod: string;
      senderPod: string;
      senderWebId: string;
      senderEmail: string;
      role: string;
      date: string;
      teamName: string;
    }) =>
      acceptInvitation({
        session: session!,
        receiverPod,
        senderPod,
        senderWebId,
        email: senderEmail,
        role,
        date,
        teamName,
      }),
    onSuccess: () => {
      if (session && session.info.webId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.inbox(session.info.webId),
        });
      }
    },
  });
};
