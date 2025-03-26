import { ButtonWithLoader } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import type { InboxItem } from '@/entities/inboxItem';
import type { Session } from '@inrupt/solid-client-authn-browser';
import type { Row } from '@tanstack/react-table';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Label } from '../../ui/label';
import { Invitation } from '@/entities/inboxItem';
import {
  useAcceptInvitation,
  useDeclineInvitation,
} from '@/use-cases/invitations';
import { useGetProfile } from '@/use-cases/profile';

interface InvitationDialogProps {
  session: Session;
  pod: string;
  data: InboxItem[];
  invitation: Invitation;
  row: Row<any>;
  closeDialog: Function;
}

export function InvitationDialogBody({
  invitation,
  pod,
  session,
  data,
  row,
  closeDialog,
}: InvitationDialogProps) {
  const formatDate = (dateString: string | undefined) => {
    if (dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE');
    }
  };
  const { mutate: declineInvitationMutation, isPending: declinePending } =
    useDeclineInvitation(session, pod);
  const { mutate: acceptInvitationMutation, isPending: acceptPending } =
    useAcceptInvitation(session);
  const [memberRole, setMemberRole] = useState<string>('Player');
  const { data: profile } = useGetProfile(session, pod);

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
          closeDialog();
        },
      }
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
                <p className="text-sm pl-7">{formatDate(invitation.date)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">From:</span>
                </div>
                <p className="text-sm plq7">{invitation.senderName}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Give {invitation.senderName} a role</Label>
              <Select onValueChange={(e) => setMemberRole(e)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Player</SelectLabel>
                    <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                    <SelectItem value="Defender">Defender</SelectItem>
                    <SelectItem value="Midfielder">Midfielder</SelectItem>
                    <SelectItem value="Forward">Forward</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Coaching</SelectLabel>
                    <SelectItem value="Coach">Coach</SelectItem>
                    <SelectItem value="Assistant Coach">
                      Assistant Coach
                    </SelectItem>
                    <SelectItem value="Goalkeeping Coach">
                      Goalkeeping Coach
                    </SelectItem>
                    <SelectItem value="Fitness Coach">Fitness Coach</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Staff</SelectLabel>
                    <SelectItem value="Owner">Owner</SelectItem>
                    <SelectItem value="Co-Owner">Co-Owner</SelectItem>
                    <SelectItem value="Medical">Medical</SelectItem>
                    <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                    <SelectItem value="Scout">Scout</SelectItem>
                    <SelectItem value="Nutritionist">Nutritionist</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
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
            isLoading={acceptPending}
            onClick={() => handleAccept(parseInt(row.id))}
          >
            Accept
          </ButtonWithLoader>
        </div>
      </DialogFooter>
    </div>
  );
}
