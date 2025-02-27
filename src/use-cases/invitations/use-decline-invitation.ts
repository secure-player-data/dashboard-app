import { useMutation, useQueryClient } from '@tanstack/react-query';
import { declineInvitation } from '@/api/inbox';
import { Session } from '@inrupt/solid-client-authn-browser';
import { queryKeys } from '../query-keys';

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
