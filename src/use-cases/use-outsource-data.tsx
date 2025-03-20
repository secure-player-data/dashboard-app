import { Session } from '@inrupt/solid-client-authn-browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { outsourcePlayerData } from '@/api/access-control';
import { Profile } from '@/entities/data/profile';
import { Member } from '@/entities/data/member';

export function useOutsourceData(session: Session | null, pod: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      profile,
      dataOwners,
      resourceUrls,
      dataReceiver,
      reason,
    }: {
      profile: Profile;
      dataOwners: Member[];
      resourceUrls: string[];
      dataReceiver: string;
      reason: string;
    }) =>
      outsourcePlayerData(
        session!,
        profile,
        pod!,
        dataOwners,
        resourceUrls,
        dataReceiver,
        reason
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.accessControl.permissionDetails(
          session?.info.webId!,
          pod!
        ),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.accessControl.resourceList(session?.info.webId!),
      });
    },
  });
}
