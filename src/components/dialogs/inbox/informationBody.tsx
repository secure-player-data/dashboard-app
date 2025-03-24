import { Information } from '@/entities/inboxItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { useDeclineInvitation } from '@/use-cases/invitations/use-decline-invitation';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

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
          <Button onClick={() => handleDeleteInformation()}>Delete</Button>
        </div>
      </DialogFooter>
    </div>
  );
}
