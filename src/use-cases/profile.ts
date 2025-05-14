import {
  deleteAppAccount,
  fetchProfileData,
  initAppProfile,
  updateAppProfile,
} from '@/api/profile';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const queryKeys = {
  profile: (pod: string) => ['profile', pod],
};

export function useGetProfile(session: Session | null, pod: string | null) {
  return useQuery({
    queryKey: queryKeys.profile(pod!),
    queryFn: () => fetchProfileData(session, pod),
    enabled: !!session?.info.webId && !!pod,
  });
}

export function useInitProfile(session: Session | null, pod: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, email }: { name: string; email: string }) => {
      return initAppProfile(session, pod, { name, email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile(session?.info.webId ?? ''),
      });
    },
  });
}

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
      picture,
    }: {
      name?: string;
      email?: string;
      teamUrl?: string;
      picture?: File;
    }) => updateAppProfile(session, pod, { name, email, teamUrl, picture }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile(session!.info.webId!),
      });
    },
  });
}

export function useDeleteAppAccount(
  session: Session | null,
  pod: string | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({}: {}) => deleteAppAccount(session, pod),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile(session!.info.webId!),
      });
    },
  });
}
