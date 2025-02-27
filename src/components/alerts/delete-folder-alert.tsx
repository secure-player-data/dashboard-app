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
import { ButtonWithLoader } from '../ui/button';
import { Trash2 } from 'lucide-react';
import { useDeleteFolder } from '@/use-cases/legacy/use-delete-folder';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';

export default function DeleteFolderAlert({
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

  const deleteFolderMutation = useDeleteFolder(session, pod, subDir);

  function handleDelete() {
    deleteFolderMutation.mutate(
      { url },
      {
        onSuccess: () => {
          onClose();
          toast.success('Folder deleted successfully');
        },
        onError: (error) => {
          toast.error(`Failed to delete folder: ${error.message}`);
        },
      }
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this folder?
          </AlertDialogTitle>
          <AlertDialogDescription>
            The folder and all its contents will be deleted from the pod and
            nobody will be able to access it again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            asChild
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
          >
            <ButtonWithLoader
              isLoading={deleteFolderMutation.isPending}
              disabled={deleteFolderMutation.isPending}
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
