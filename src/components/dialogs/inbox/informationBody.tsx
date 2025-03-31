import { Information } from '@/entities/inboxItem';
import { Button, ButtonWithLoader } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import { useDeclineInvitation } from '@/use-cases/invitations';

interface InformationBodyProps {
  information: Information;
  closeDialog: Function;
}

export function InformationDialogBody({
  information,
  closeDialog,
}: InformationBodyProps) {
  const { session, pod } = useAuth();
  const { mutate: declineInvitationMutation, isPending: declinePending } =
    useDeclineInvitation(session, pod);

  const handleDeleteInformation = () => {
    declineInvitationMutation(
      { date: information.date! },
      {
        onError: (error) => {
          toast('Error declining invitation: ' + error.message);
        },
        onSuccess: () => closeDialog(),
      }
    );
  };

  const handleInformationBody = (informationBody: string) => {
    return (
      <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
        {informationBody}
      </div>
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE');
    }
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
                <p className="text-sm pl-7">{formatDate(information.date)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">From:</span>
                </div>
                <p className="text-sm pl-7">{information.senderName}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2 pt-7">
                {information.informationHeader}
              </div>
              <div className="flex items-center gap-2 mb-2 pt-7">
                {handleInformationBody(information.informationBody)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <DialogFooter className="sm:justify-end gap-2 mt-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => closeDialog()}>
            Cancel
          </Button>
          <ButtonWithLoader
            isLoading={declinePending}
            onClick={() => handleDeleteInformation()}
          >
            Delete
          </ButtonWithLoader>
        </div>
      </DialogFooter>
    </div>
  );
}
