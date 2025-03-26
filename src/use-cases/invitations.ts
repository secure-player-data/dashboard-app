import {
  acceptInvitation,
  declineInvitation,
  fetchInbox,
  sendInvitation,
} from '@/api/inbox';
import { InboxItem } from '@/entities/inboxItem';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const queryKeys = {
  inbox: (webId: string) => ['inbox', webId],
};

export function useGetInbox(session: Session | null, pod: string | null) {
  return useQuery({
    queryKey: queryKeys.inbox(session?.info.webId ?? ''),
    queryFn: () => fetchInbox(session, pod),
    enabled: !!session && !!pod,
  });
}

export const useSendInvitation = () => {
  return useMutation({
    mutationFn: ({
      session,
      receiverPod,
      invitation,
    }: {
      session: Session;
      receiverPod: string;
      invitation: InboxItem;
    }) => sendInvitation(session, receiverPod, invitation),
  });
};

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

export const useDeclineInvitation = (
  session: Session | null,
  pod: string | null
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date }: { date: string }) =>
      declineInvitation(session, pod, date),
    onSuccess: () => {
      if (session && session.info.webId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.inbox(session.info.webId),
        });
      }
    },
  });
};
