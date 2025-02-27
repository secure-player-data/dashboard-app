import { Session } from '@inrupt/solid-client-authn-browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { updateAppProfile } from '@/api/profile';

export function useUpdateAppProfile(
  session: Session | null,
  pod: string | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      email,
      teamUrl,
    }: {
      name?: string;
      email?: string;
      teamUrl?: string;
    }) => updateAppProfile(session, pod, { name, email, teamUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile(session!.info.webId!),
      });
    },
  });
}
