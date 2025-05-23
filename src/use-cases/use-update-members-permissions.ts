import {
  ActorWithPermissions,
  MemberWithPermissions,
} from '@/entities/data/member';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { updateActorPermissions } from '@/api/member';

export function useUpdateActorPermissions(
  session: Session | null,
  pod: string | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data:
        | MemberWithPermissions
        | ActorWithPermissions
        | MemberWithPermissions[]
    ) => updateActorPermissions(data, session, pod),
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
