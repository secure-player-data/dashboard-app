import { Trash } from 'lucide-react';
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
import { useDeleteData } from '@/use-cases/data';
import { useAuth } from '@/context/auth-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

export function DeleteDataDialog({
  numberOfSelected,
}: {
  numberOfSelected: number;
}) {
  const { session } = useAuth();
  const mutation = useDeleteData(session);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" disabled={numberOfSelected === 0}>
          <Trash /> Delete selected
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete data</DialogTitle>
          <DialogDescription>
            Select how you want to delete the data.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
