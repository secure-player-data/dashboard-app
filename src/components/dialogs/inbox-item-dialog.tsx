import { Button, ButtonWithLoader } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, Building, Info, Eye } from 'lucide-react';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { flexRender } from '@tanstack/react-table';
import type { InboxItem } from '@/entities/inboxItem';
import type { Session } from '@inrupt/solid-client-authn-browser';
import { TableCell, TableRow } from '@/components/ui/table';
import type { Row } from '@tanstack/react-table';
import { useDeclineInvitation } from '@/use-cases/invitations/use-decline-invitation';
import { toast } from 'sonner';
import { useAcceptInvitation } from '@/use-cases/invitations/use-accept-invitation';
import { useState } from 'react';
import { useGetProfile } from '@/use-cases/use-get-profile';

interface TableRowDialogProps {
  session: Session;
  pod: string;
  data: InboxItem[];
  row: Row<any>;
}

export function TableRowDialog({
  session,
  pod,
  data,
  row,
}: TableRowDialogProps) {
  const [open, setOpen] = useState<boolean>(false);
  const { mutate: declineInvitationMutation, isPending: declinePending } =
    useDeclineInvitation(session, pod);
  const { mutate: acceptInvitationMutation, isPending: acceptPending } =
    useAcceptInvitation(session);
  const [memberRole, setMemberRole] = useState<string>('Player');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  };

  const { data: profile } = useGetProfile(session, pod);

  const handleAccept = (rowId: number, inboxItemType: string) => {
    const invitation = data[rowId];

    if (!session) {
      toast('Could not find session, please try again');
      return;
    }

    if (!invitation.date) {
      toast('Error when accepting, please try again');
      return;
    }

    if (inboxItemType === 'Invitation') {
      acceptInvitationMutation(
        {
          receiverPod: pod,
          senderPod: invitation.podUrl,
          senderWebId: invitation.webId,
          senderEmail: invitation.email,
          role: memberRole,
          date: invitation.date!,
          teamName: profile?.team?.name ?? 'Team',
        },
        {
          onError: (error) => {
            toast('Error accepting invitation: ' + error.message);
          },
          onSuccess: () => {
            setOpen(false);
          },
        }
      );
    }
  };

  const handleInformationBody = (informationBody: string) => {
    const bodyHeader = informationBody.split(';')[0];
    const resources = informationBody.split(';')[1];
    const reason = informationBody.split(';')[2];

    return (
      <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="text-lg font-semibold text-primary mb-3">
          {bodyHeader}
        </div>
        <div className="mb-3">
          <div className="font-medium mb-1">Resources:</div>
          <ul className="space-y-1 pl-5 list-disc text-sm text-muted-foreground">
            {resources ? (
              resources
                .split(',')
                .map((resource, index) => (
                  <li key={index}>{resource.trim()}</li>
                ))
            ) : (
              <li>No resources listed</li>
            )}
          </ul>
        </div>
        <div className="pt-2 border-t">
          <span className="font-medium">Reason: </span>
          <span className="text-sm text-muted-foreground">
            {reason || 'No reason provided'}
          </span>
        </div>
      </div>
    );
  };

  const handleDecline = (rowId: number) => {
    const invitation = data[rowId];

    if (!session) {
      toast('Error when declining, please try again');
      return;
    }

    if (!invitation.date) {
      toast('Error when declining, please try again');
      return;
    }

    declineInvitationMutation(
      {
        date: invitation.date!,
      },
      {
        onError: (error) => {
          toast('Error declining invitation: ' + error.message);
        },
        onSuccess: () => setOpen(false),
      }
    );
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
            {row.original.type}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="pb-8">
              {row.original.type === 'Access Request' && (
                <div>
                  <div>
                    {row.original.organization} asking for access to your
                    data.{' '}
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
            </div>
          </DialogDescription>{' '}
        </DialogHeader>
        <Card className="border-0 shadow-none">
          <CardContent>
            <div className="grid gap-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Received:</span>
                  </div>
                  <p className="text-sm pl-7">
                    {formatDate(row.original.date)}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">From:</span>
                  </div>
                  <p className="text-sm pl-7">{row.original.senderName}</p>
                </div>

                {row.original.type === 'Access Request' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">Organization:</span>
                    </div>
                    <p className="text-sm pl-7">{row.original.organization}</p>
                  </div>
                )}
              </div>
              {row.original.type === 'Access Request' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-5 w-5 text-muted-foreground" />
                    <span className="text-lg font-semibold">
                      Reason for Access:
                    </span>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-md text-sm leading-relaxed">
                    {row.original.accessReason}
                  </div>
                </div>
              )}
              {row.original.type === 'Invitation' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2 pt-7">
                    {row.original.senderName} needs a role if they are to be
                    accepted
                  </div>
                  <Input
                    placeholder="Player"
                    onChange={(event) => setMemberRole(event.target.value)}
                  ></Input>
                </div>
              )}
              {row.original.type === 'Information' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2 pt-7">
                    {row.original.informationHeader}
                  </div>
                  <div className="flex items-center gap-2 mb-2 pt-7">
                    {handleInformationBody(row.original.informationBody)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <DialogFooter className="sm:justify-end gap-2 mt-6">
          {row.original.type !== 'Information' ? (
            <div className="flex gap-2">
              <ButtonWithLoader
                isLoading={declinePending}
                variant="outline"
                onClick={() => handleDecline(Number.parseInt(row.id))}
              >
                Decline
              </ButtonWithLoader>
              <ButtonWithLoader
                isLoading={acceptPending}
                onClick={() =>
                  handleAccept(parseInt(row.id), row.original.type)
                }
              >
                Accept
              </ButtonWithLoader>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(!open)}>
                Cancel
              </Button>
              <ButtonWithLoader
                isLoading={declinePending}
                onClick={() => handleDecline(Number.parseInt(row.id))}
              >
                Delete
              </ButtonWithLoader>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
