import { createTeam, leaveTeam, updateTeam } from '@/api/team';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys as profileQueryKeys } from './profile';

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
  });
}
