import { updateTeam } from '@/api/team';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';

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
        queryKey: queryKeys.profile(session?.info.webId ?? ''),
      });
    },
  });
}
