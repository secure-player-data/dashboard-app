import { createTeam } from '@/api/team';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';

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
        queryKey: queryKeys.profile(session?.info.webId ?? ''),
      });
    },
  });
}
