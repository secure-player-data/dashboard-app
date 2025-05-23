import { LogOut } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button, ButtonWithLoader } from '../ui/button';
import { useState } from 'react';
import { useLeaveTeam } from '@/use-cases/team';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import { handleError } from '@/utils';
import { log } from '@/lib/log';
import { TeamOwnerException } from '@/exceptions/team-exceptions';

export default function LeaveTeamDialog() {
  const { session, pod } = useAuth();
  const [open, setOpen] = useState(false);
  const mutation = useLeaveTeam();

  function handleLeaveTeam() {
    mutation.mutate(
      { session, pod },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success('You have left the team');
        },
        onError: (error) => {
          if (error instanceof TeamOwnerException) {
            toast.error(
              'You cannot leave the team as you are the owner. Please transfer ownership to another member before leaving. Alternatively, you can delete the team.'
            );
          } else {
            toast.error(handleError(error));
          }
        },
      }
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <LogOut className="size-4" />
          Leave team
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave team</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to leave the team? This will remove all the
            access you have to the team and everyone in the team will lose
            access to your data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <ButtonWithLoader
            variant="destructive"
            onClick={handleLeaveTeam}
            isLoading={mutation.isPending}
          >
            Leave team
          </ButtonWithLoader>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
