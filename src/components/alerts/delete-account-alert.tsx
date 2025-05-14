import { LogOut } from 'lucide-react';
import {
  AlertDialog,
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
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import { useDeleteAppAccount } from '@/use-cases/profile';

export default function DeleteAccountDialog() {
  const { session, pod, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const deleteAccount = useDeleteAppAccount(session, pod);

  const handleDeleteAccount = async () => {
    deleteAccount.mutate(
      {},
      {
        onError: () => {
          toast.error(
            'Something went wrong! if this error persists, you could always delete the account from your pod using a pod browsing tool.'
          );
        },
        onSuccess: () => {
          toast('Deleted, goodbye!');
          signOut();
        },
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <LogOut className="size-4" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Account</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete the 'Secure-player-data' container in your pod, and
            delete all data contained within this container.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            To confirm, type your <strong>WebId</strong> below:
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
          <AlertDialogCancel onClick={() => setConfirmText('')}>
            Cancel
          </AlertDialogCancel>
          <ButtonWithLoader
            variant="destructive"
            onClick={handleDeleteAccount}
            isLoading={deleteAccount.isPending}
            disabled={confirmText !== session?.info.webId}
          >
            Delete Account{' '}
          </ButtonWithLoader>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
