import { ButtonWithLoader } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useRemoveMemberFromTeam } from '@/use-cases/team';
import { User } from 'lucide-react';

export default function LeaveTeamDialogBody({
  webId,
  date,
  body,
  closeDialog,
}: {
  webId: string;
  date: string;
  body: string;
  closeDialog: () => void;
}) {
  const { session, pod } = useAuth();
  const mutation = useRemoveMemberFromTeam(session, pod);

  function handleClick() {
    mutation.mutate(
      {
        webId,
        date,
      },
      {
        onSuccess: () => closeDialog(),
      }
    );
  }

  return (
    <div className="grid gap-4">
      <p className="flex  items-center gap-2 border p-4 rounded-md">
        <User className="size-4" />
        {body}
      </p>
      <ButtonWithLoader isLoading={mutation.isPending} onClick={handleClick}>
        Acknowledge
      </ButtonWithLoader>
    </div>
  );
}
