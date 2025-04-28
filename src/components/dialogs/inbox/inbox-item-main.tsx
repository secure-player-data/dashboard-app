import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { flexRender } from '@tanstack/react-table';
import type { InboxItem } from '@/entities/inboxItem';
import type { Session } from '@inrupt/solid-client-authn-browser';
import { TableCell, TableRow } from '@/components/ui/table';
import type { Row } from '@tanstack/react-table';
import { useState } from 'react';
import { InformationDialogBody } from './informationBody';
import { AccessRequestDialogBody } from './accessRequestBody';
import { InvitationDialogBody } from './invitationBody';
import { DataDeletionRequestDialogBody } from './data-deletion-request-dialog-body';

interface InboxTableRowDialog {
  session: Session;
  pod: string;
  data: InboxItem[];
  row: Row<any>;
}

export function InboxTableRowDialog({
  session,
  pod,
  data,
  row,
}: InboxTableRowDialog) {
  const [open, setOpen] = useState<boolean>(false);

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TableRow
          key={(row.original as InboxItem).date}
          data-state={row.getIsSelected() && 'selected'}
          className="cursor-pointer"
          onClick={() => setOpen(true)}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}

          <TableCell className="flex justify-end items-center gap-2">
            <Button className="border-[1.5px] rounded-md" variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              view
            </Button>
          </TableCell>
        </TableRow>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
        onEscapeKeyDown={() => setOpen(false)}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold mb-4 text-primary">
            {row.original.type === 'Invitation'
              ? 'Join Request'
              : row.original.type}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="pb-8">
              {row.original.type === 'Access Request' && (
                <div>
                  <div>
                    {row.original.organization} asking for access to your data.{' '}
                  </div>
                  <div>
                    If you choose to accept you will grant them access to your
                    data. This can be revoked at any time.
                  </div>
                </div>
              )}
              {row.original.type === 'Invitation' && (
                <div>
                  <div>A User wants to be part of your team.</div>
                  <div>
                    If you choose to accept, you will add them to your team with
                    the role you specify.
                  </div>
                </div>
              )}
              {row.original.type === 'Information' && (
                <div>
                  <div>Information about an action on your pod.</div>
                </div>
              )}
              {row.original.type === 'Data Deletion Notification' && (
                <div>Player has demanded to have their data deleted.</div>
              )}
            </div>
          </DialogDescription>{' '}
        </DialogHeader>
        {row.original.type === 'Information' && (
          <InformationDialogBody
            information={row.original}
            closeDialog={closeDialog}
          ></InformationDialogBody>
        )}
        {row.original.type === 'Access Request' && (
          <AccessRequestDialogBody
            session={session}
            accessRequest={row.original}
            pod={pod}
            data={data}
            row={row}
            closeDialog={closeDialog}
          ></AccessRequestDialogBody>
        )}
        {row.original.type === 'Invitation' && (
          <InvitationDialogBody
            invitation={row.original}
            pod={pod}
            session={session}
            data={data}
            row={row}
            closeDialog={closeDialog}
          ></InvitationDialogBody>
        )}
        {row.original.type === 'Data Deletion Notification' && (
          <DataDeletionRequestDialogBody
            request={row.original}
            closeDialog={closeDialog}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
