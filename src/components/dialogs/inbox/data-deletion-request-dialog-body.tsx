import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ButtonWithLoader } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/auth-context';
import { DataDeletionRequest } from '@/entities/inboxItem';
import { useConfirmDataDeletion } from '@/use-cases/data';
import { Building2, CircleAlert, User } from 'lucide-react';

export function DataDeletionRequestDialogBody({
  request,
}: {
  request: DataDeletionRequest;
}) {
  const { session } = useAuth();
  const mutation = useConfirmDataDeletion(session);

  return (
    <div className="grid">
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="col-span-2">
          <h2 className="font-semibold">Delete Request Details</h2>
          <p className="text-sm text-muted-foreground">
            Details about the user that send the deletion request
          </p>
        </div>
        <div className="flex items-center gap-2">
          <User />
          <div>
            <p className="text-sm text-muted-foreground">Requested By</p>
            <p>{request.senderName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Building2 />
          <div>
            <p className="text-sm text-muted-foreground">Organization</p>
            <p>{request.organization}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 mb-8">
        <div className="">
          <h2 className="font-semibold">Data Details</h2>
          <p className="text-sm text-muted-foreground">
            Details about the data to be deleted
          </p>
        </div>
        <Table className="border rounded-md">
          <TableHeader>
            <TableHead>Id</TableHead>
            <TableHead>Location</TableHead>
          </TableHeader>
          <TableBody>
            {request.data.map((item, i) => (
              <TableRow key={item.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{item.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Alert className="flex border-red-400 mb-4">
        <CircleAlert />
        <div className="ml-2">
          <AlertTitle className="text-red-500">Important</AlertTitle>
          <AlertDescription>
            This data has to be deleted from the third-party system! When done,
            confirm that the data has been deleted by pressing the confirm
            button below.
          </AlertDescription>
        </div>
      </Alert>
      <ButtonWithLoader isLoading={false}>Confirm Deletion</ButtonWithLoader>
    </div>
  );
}
