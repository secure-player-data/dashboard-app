import { useAuth } from '@/context/auth-context';
import { useNavigate } from '@tanstack/react-router';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { ButtonWithLoader } from '../ui/button';
import { InboxItem } from '@/entities/inboxItem';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { useGetProfile } from '@/use-cases/profile';
import { useSendInvitation } from '@/use-cases/invitations';

const joinTeamSchema = z.object({
  ownerPod: z.string().nonempty({ message: 'Owner Pod is required' }),
});

type JoinTeamSchema = z.infer<typeof joinTeamSchema>;

type ErrorsState = Partial<Record<keyof JoinTeamSchema, string>>;

export default function JoinTeamForm() {
  const navigate = useNavigate();
  const { session, pod } = useAuth();
  const { data: profile } = useGetProfile(session, pod);

  const [ownerPod, setOwnerPod] = useState<string>('');
  const [errors, setErrors] = useState<ErrorsState>({});

  const sendInvitationMutation = useSendInvitation();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});

    if (!session || !session.info.webId || !profile || !pod) {
      toast.error(
        'Something wnet wrong. please try to re-login and try again.'
      );
      return;
    }

    const validation = joinTeamSchema.safeParse({ ownerPod });

    if (!validation.success) {
      const newErrors: { [key: string]: string | null } = {};
      validation.error.errors.forEach((error) => {
        newErrors[error.path[0]] = error.message;
      });

      setErrors(newErrors);
      return;
    }

    const invitation = {
      type: 'Invitation',
      senderName: profile.name,
      email: profile.email,
      webId: session.info.webId!,
      podUrl: pod,
      date: new Date().toISOString(),
    } as InboxItem;

    sendInvitationMutation.mutate(
      {
        session,
        receiverPod: ownerPod,
        invitation,
      },
      {
        onSuccess: () => {
          toast.success(
            'Request sent successfully. You will receive an email when the owner accepts your request!'
          );
        },
        onError: (error) => {
          toast.error(`Failed to send request: ${error.message}`);
        },
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join a team</CardTitle>
        <CardDescription>Send a request to join a team</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <Label htmlFor="owner-pod">
              Owner Pod <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              id="owner-pod"
              value={ownerPod}
              onChange={(e) => setOwnerPod(e.target.value)}
              placeholder="https://pod.provider.com"
              className={errors['ownerPod'] ? 'border-destructive' : ''}
            />
            {errors['ownerPod'] && (
              <p className="text-sm text-destructive">{errors['ownerPod']}</p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="underline">Tip:</span> Ask the owner of your team
            for their storage url
          </p>
          <ButtonWithLoader
            type="submit"
            isLoading={sendInvitationMutation.isPending}
            disabled={sendInvitationMutation.isPending}
            className="w-full"
          >
            Send request
          </ButtonWithLoader>
        </form>
      </CardContent>
    </Card>
  );
}
