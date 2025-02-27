import { Session } from '@inrupt/solid-client-authn-browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { initAppProfile } from '@/api/profile';

export function useInitProfile(session: Session | null, pod: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, email }: { name: string; email: string }) => {
      return initAppProfile(session, pod, { name, email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile(session!.info.webId!),
      });
    },
  });
}
