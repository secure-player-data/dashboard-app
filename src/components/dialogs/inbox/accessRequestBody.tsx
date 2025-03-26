import { ButtonWithLoader } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, Building, Info } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import type { AccessRequest, InboxItem } from '@/entities/inboxItem';
import type { Session } from '@inrupt/solid-client-authn-browser';
import type { Row } from '@tanstack/react-table';
import { toast } from 'sonner';
import { useDeclineInvitation } from '@/use-cases/invitations';

interface accessRequestDialogProps {
  session: Session;
  accessRequest: AccessRequest;
  pod: string;
  data: InboxItem[];
  row: Row<any>;
  closeDialog: Function;
}

export function AccessRequestDialogBody({
  session,
  accessRequest,
  pod,
  data,
  row,
  closeDialog,
}: accessRequestDialogProps) {
  const { mutate: declineInvitationMutation, isPending: declinePending } =
    useDeclineInvitation(session, pod);

  const formatDate = (dateString: string | undefined) => {
    if (dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE');
    }
  };

  const handleAccept = (rowId: number) => {
    const invitation = data[rowId];

    if (!session) {
      toast('Could not find session, please try again');
      return;
    }

    if (!invitation.date) {
      toast('Error when accepting, please try again');
      return;
    }

    //TODO handle accessrequest acception
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
        onSuccess: () => closeDialog(),
      }
    );
  };

  return (
    <div>
      <Card className="border-0 shadow-none">
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Received:</span>
                </div>
                <p className="text-sm pl-7">{formatDate(accessRequest.date)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">From:</span>
                </div>
                <p className="text-sm pl-7">{accessRequest.senderName}</p>
              </div>

              {accessRequest.type === 'Access Request' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Organization:</span>
                  </div>
                  <p className="text-sm pl-7">{accessRequest.organization}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-semibold">
                  Reason for Access:
                </span>
              </div>
              <div className="bg-primary/5 p-4 rounded-md text-sm leading-relaxed">
                {accessRequest.accessReason}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <DialogFooter className="sm:justify-end gap-2 mt-6">
        <div className="flex gap-2">
          <ButtonWithLoader
            isLoading={declinePending}
            variant="outline"
            onClick={() => handleDecline(Number.parseInt(row.id))}
          >
            Decline
          </ButtonWithLoader>
          <ButtonWithLoader
            isLoading={false}
            onClick={() => handleAccept(parseInt(row.id))}
          >
            Accept
          </ButtonWithLoader>
        </div>
      </DialogFooter>
    </div>
  );
}
