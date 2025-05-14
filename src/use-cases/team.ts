import {
  createTeam,
  leaveTeam,
  removeMemberFromTeam,
  updateTeam,
} from '@/api/team';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys as profileQueryKeys } from './profile';
import { log } from '@/lib/log';
import { queryKeys as inboxQueryKeys } from './invitations';

export function useCreateTeam(session: Session | null, pod: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, tag }: { name: string; tag: string }) => {
      if (!session) {
        return Promise.reject(new Error('Session not found'));
      }
      return createTeam({
        session,
        pod,
        name,
        tag,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.profile(pod ?? ''),
      });
    },
  });
}

export function useUpdateTeam(session: Session | null, pod: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (team: {
      img?: File;
      name: string;
      tag: string;
      founded?: string;
      location?: string;
    }) =>
      updateTeam({
        session,
        pod,
        team,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.profile(pod ?? ''),
      });
    },
  });
}

export function useLeaveTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      session,
      pod,
    }: {
      session: Session | null;
      pod: string | null;
    }) => {
      await leaveTeam(session, pod);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      log({
        type: 'error',
        label: 'Leave Team',
        message: 'Error leaving team',
        obj: error,
      });
    },
  });
}

export function useRemoveMemberFromTeam(
  session: Session | null,
  pod: string | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ webId, date }: { webId: string; date: string }) => {
      await removeMemberFromTeam(session, pod, webId, date);
    },
    onSuccess: () => {
      if (session && session.info.webId) {
        queryClient.invalidateQueries({
          queryKey: inboxQueryKeys.inbox(session.info.webId),
        });
        queryClient.invalidateQueries({
          queryKey: profileQueryKeys.profile(session.info.webId),
        });
      }
    },
  });
}
