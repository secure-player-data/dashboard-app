import { MemberWithPermissions } from '@/entities/data/member';
import { Session } from '@inrupt/solid-client-authn-browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { updateMembersPermissions } from '@/api/member';

export function useUpdateMembersPermissions(
  session: Session | null,
  pod: string | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MemberWithPermissions[]) =>
      updateMembersPermissions(data, session, pod),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.members.withPermissions(session?.info.webId ?? ''),
      });
    },
  });
}
