import { AlertCircle, Trash } from 'lucide-react';
import { Button, ButtonWithLoader } from '../ui/button';
import { useSendDataSeletionRequest } from '@/use-cases/data';
import { useAuth } from '@/context/auth-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { log } from '@/lib/log';
import { Route } from '@/routes/__dashboard/player/$pod/$category';
import { DataInfo } from '@/entities/data-info';
import { TeamNotFoundException } from '@/exceptions/team-exceptions';

export function DeleteDataDialog({
  selected,
  onDelete,
}: {
  selected: DataInfo[];
  onDelete: () => void;
}) {
  const { session } = useAuth();
  const { pod, category } = Route.useParams();

  const [open, setOpen] = useState(false);
  const [deleteFromPod, setDeleteFromPod] = useState(false);

  const mutation = useSendDataSeletionRequest(session, pod, category);

  const numberOfSelected = useMemo(() => {
    return Object.keys(selected).length;
  }, [selected]);

  function handleDelete() {
    mutation.mutate(
      { data: selected, deleteFromPod },
      {
        onSuccess: () => {
          setOpen(false);
          setDeleteFromPod(false);
          onDelete();
          if (deleteFromPod) {
            toast.success(
              'Data has been deleted from your pod and a request has been sent to delete the data from third-party systems.'
            );
          } else {
            toast.success(
              'A request has been sent to delete the data from third-party systems.'
            );
          }
        },
        onError: (error) => {
          log({
            type: 'error',
            label: 'DeleteDataDialog',
            message: error.message,
            obj: error,
          });
          if (error instanceof TeamNotFoundException) {
            toast.error(
              'You are not part of a team. Cannot send deletion request.'
            );
          } else {
            toast.error(
              'An error occurred while deleting the data, please try again!'
            );
          }
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" disabled={numberOfSelected === 0}>
          <Trash /> Delete selected
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete data</DialogTitle>
          <DialogDescription>
            This will send a request to delete the selected Data from
            third-party systems.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              By continuing, a request will be sent to the team owner to delete
              the selected data from third-party systems.
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground">
            You will receive a notification when the deletion process has been
            completed.
          </p>

          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="delete-main"
              checked={deleteFromPod}
              onCheckedChange={(checked) => setDeleteFromPod(checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="delete-main" className="text-sm">
                <p className="font-medium leading-none mb-1 peer-disabled:cursor-no-allowed peer-disabled:opacity-70">
                  Also delete from pod
                </p>
                <p className="text-muted-foreground">
                  When checked, the data will also be deleted from your pod in
                  addition to the third-party request.
                </p>
              </label>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <ButtonWithLoader
            type="button"
            variant="destructive"
            onClick={handleDelete}
            isLoading={mutation.isPending}
          >
            Confirm Deletion
          </ButtonWithLoader>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
