import { Trash } from 'lucide-react';
import { Button, ButtonWithLoader } from '../ui/button';
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
import { useMemo, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Route } from '@/routes/__dashboard/player/$pod/$category';
import { DataInfo } from '@/entities/data-info';
import {
  useSendDeletionRequest,
  useSendDeletionRequestAndDeleteData,
} from '@/use-cases/data';
import { toast } from 'sonner';
import { useGetProfile } from '@/use-cases/profile';
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

  const { data: profile } = useGetProfile(session, pod);

  const requestMutation = useSendDeletionRequest(session, pod, category);
  const requestAndDeleteMutation = useSendDeletionRequestAndDeleteData(
    session,
    pod,
    category
  );

  const numberOfSelected = useMemo(() => {
    return Object.keys(selected).length;
  }, [selected]);

  const showOptionOne = useMemo(() => {
    return selected.some((data) => data.status === '');
  }, [selected]);

  const showWarning = useMemo(() => {
    return (
      selected.some(
        (data) => data.status === 'Requested' || data.status === 'Confirmed'
      ) && selected.some((data) => data.status === '')
    );
  }, [selected]);

  function handleDeletionRequest() {
    requestMutation.mutate(
      {
        data: selected,
        sender: {
          name: profile?.name ?? '',
          organization: profile?.team?.name ?? '',
        },
      },
      {
        onSuccess: () => handleSuccess('Deletion request sent'),
        onError: handleError,
      }
    );
  }

  function handleDeletionRequestAndDelete() {
    requestAndDeleteMutation.mutate(
      {
        data: selected,
        sender: {
          name: profile?.name ?? '',
          organization: profile?.team?.name ?? '',
        },
      },
      {
        onSuccess: () =>
          handleSuccess('Deletion request sent and data deleted'),
        onError: handleError,
      }
    );
  }

  function handleSuccess(msg: string) {
    setOpen(false);
    onDelete();
    toast.success(msg);
  }

  function handleError(error: Error) {
    if (error instanceof TeamNotFoundException) {
      toast.error(error.message);
    } else {
      toast.error('Something went wrong, please try again later');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" disabled={numberOfSelected === 0}>
          <Trash /> Delete selected
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Delete data</DialogTitle>
          <DialogDescription>
            Choose how you want to delete the selected data:
          </DialogDescription>
        </DialogHeader>
        <div
          className={`grid gap-4 ${showOptionOne ? 'grid-cols-2' : 'grid-cols-1'}`}
        >
          {showOptionOne && (
            <div className="flex flex-col border p-4 rounded-md">
              <h2 className="font-semibold text-xl mb-2">
                Option 1: Request deletion from origin
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Request deletion from the third-party system. You will be
                notified upon confirmation.
              </p>
              <div className="flex-grow flex items-center">
                {showWarning && (
                  <Alert className="mb-4 border-warning text-warning">
                    <AlertTitle>Note</AlertTitle>
                    <AlertDescription>
                      This will only affect items that haven't already had a
                      deletion requests send!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <ButtonWithLoader
                variant="destructive"
                className="w-full"
                isLoading={requestMutation.isPending}
                onClick={handleDeletionRequest}
              >
                Request External Deletion Only
              </ButtonWithLoader>
            </div>
          )}
          <div className="flex flex-col border p-4 rounded-md">
            <div className="flex-grow">
              <h2 className="font-semibold text-xl mb-2">
                {showOptionOne && 'Option 2: '}Complete deletion
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Request deletion from the third-party system AND immediately
                delete data from your pod. You will be notified upon third-party
                confirmation.
              </p>
              {showWarning && (
                <Alert className="mb-4 border-warning text-warning">
                  <AlertTitle>Note</AlertTitle>
                  <AlertDescription>
                    Items with pending deletion requests will be removed from
                    you pod immediately. You will still receive a notification
                    when upon third-party confirmation in your inbox.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <ButtonWithLoader
              variant="destructive"
              className="w-full"
              isLoading={requestAndDeleteMutation.isPending}
              onClick={handleDeletionRequestAndDelete}
            >
              Delete Completely
            </ButtonWithLoader>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
