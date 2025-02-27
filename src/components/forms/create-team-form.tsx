import { useAuth } from '@/context/auth-context';
import { useCreateTeam } from '@/use-cases/use-create-team';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { ButtonWithLoader } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

const createTeamSchema = z.object({
  teamName: z.string().nonempty({ message: 'Team Name is required' }),
  teamTag: z.string().nonempty({ message: 'Team Tag is required' }),
});

type CreateTeamSchema = z.infer<typeof createTeamSchema>;

type ErrorsState = Partial<Record<keyof CreateTeamSchema, string>>;

export default function CreateTeamForm() {
  const { session, pod } = useAuth();

  const [teamName, setTeamName] = useState<string>('');
  const [teamTag, setTeamTag] = useState<string>('');
  const [errors, setErrors] = useState<ErrorsState>({});

  const createTeamMutation = useCreateTeam(session, pod);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});

    const validation = createTeamSchema.safeParse({ teamName, teamTag });

    if (!validation.success) {
      const newErrors: { [key: string]: string | null } = {};
      validation.error.errors.forEach((error) => {
        newErrors[error.path[0]] = error.message;
      });

      setErrors(newErrors);
      return;
    }

    createTeamMutation.mutate(
      {
        name: teamName,
        tag: teamTag,
      },
      {
        onError: (error) => {
          toast.error(`Failed to create team: ${error.message}`);
        },
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Team</CardTitle>
        <CardDescription>Create and manage your own team</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <Label htmlFor="team-name">
              Team name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              type="text"
              placeholder="Rosenborg"
              className={errors['teamName'] ? 'border-destructive' : ''}
            />
            {errors['teamName'] && (
              <p className="text-sm text-destructive">{errors['teamName']}</p>
            )}
          </div>
          <div>
            <Label htmlFor="team-tag">
              Tag <span className="text-destructive">*</span>
            </Label>
            <Input
              id="team-tag"
              value={teamTag}
              onChange={(e) => setTeamTag(e.target.value)}
              type="text"
              placeholder="RBK"
              className={errors['teamTag'] ? 'border-destructive' : ''}
            />
            {errors['teamTag'] && (
              <p className="text-sm text-destructive">{errors['teamTag']}</p>
            )}
          </div>
          <ButtonWithLoader
            type="submit"
            isLoading={createTeamMutation.isPending}
            disabled={createTeamMutation.isPending}
            className="w-full"
          >
            Create team
          </ButtonWithLoader>
        </form>
      </CardContent>
    </Card>
  );
}
