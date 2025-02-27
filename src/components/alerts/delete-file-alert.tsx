import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteFile } from '@/use-cases/legacy/use-delete-file';
import { buttonVariants, ButtonWithLoader } from '../ui/button';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import { useMemo } from 'react';

export default function DeleteFileAlert({
  isOpen,
  onClose,
  url,
  subDir,
}: {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  subDir?: string;
}) {
  const { session, pod } = useAuth();

  const deleteFileMutataion = useDeleteFile(session, pod, subDir);

  function handleConfirm() {
    deleteFileMutataion.mutate(
      {
        url,
      },
      {
        onSuccess: () => {
          onClose();
          toast.success('File deleted successfully');
        },
        onError: (error) => {
          toast.error(`Failed to delete file: ${error.message}`);
        },
      }
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this file?
          </AlertDialogTitle>
          <AlertDialogDescription>
            The file will be deleted from the pod and nobody will be able to
            access it again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            asChild
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            <ButtonWithLoader
              isLoading={deleteFileMutataion.isPending}
              disabled={deleteFileMutataion.isPending}
              variant="destructive"
            >
              <Trash2 className="size-4" /> Delete
            </ButtonWithLoader>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
