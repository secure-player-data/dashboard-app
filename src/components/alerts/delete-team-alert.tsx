import { Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button, ButtonWithLoader } from '../ui/button';
import { AlertDialogCancel } from '@radix-ui/react-alert-dialog';
import { useAuth } from '@/context/auth-context';
import { useMemo, useState } from 'react';
import { useDeleteTeam } from '@/use-cases/team';
import { useGetProfile } from '@/use-cases/profile';
import { toast } from 'sonner';

export default function DeleteTeamAlert() {
  const { session, pod } = useAuth();
  const { data: profile } = useGetProfile(session, pod);
  const mutation = useDeleteTeam(pod);

  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const enableDeletion = useMemo(() => {
    return confirmText === profile?.team?.name;
  }, [confirmText, profile]);

  function handleDeleteTeam() {
    if (!enableDeletion) return;

    mutation.mutate(
      {
        session,
      },
      {
        onSuccess: () => {
          toast.success('Team deleted successfully');
        },
        onError: (error) => {
          toast.error(`Error deleting team: ${error.message}`);
        },
      }
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash className="size-4" /> Delete Team
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Team</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the team? All the relevant team data
            will be deleted and members will no longer have access to this team.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            To confirm, type <strong>"{profile?.team?.name}"</strong> below:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-destructive"
            placeholder="Type here..."
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <ButtonWithLoader
            isLoading={mutation.isPending}
            disabled={!enableDeletion || mutation.isPending}
            onClick={handleDeleteTeam}
            variant="destructive"
          >
            Delete Team
          </ButtonWithLoader>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
