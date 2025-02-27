import { useMutation } from '@tanstack/react-query';
import { sendInvitation } from '@/api/inbox';
import { InboxItem } from '@/entities/inboxItem';
import { Session } from '@inrupt/solid-client-authn-browser';

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
