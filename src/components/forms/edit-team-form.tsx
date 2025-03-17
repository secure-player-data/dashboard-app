import { z } from 'zod';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useGetProfile } from '@/use-cases/use-get-profile';
import { useAuth } from '@/context/auth-context';
import { FormEvent, useState } from 'react';
import { Button, ButtonWithLoader } from '../ui/button';
import { useUpdateTeam } from '@/use-cases/team';

const teamSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  tag: z.string().nonempty({ message: 'Tag is required' }),
  founded: z.string().optional(),
  location: z.string().optional(),
});

type TeamSchema = z.infer<typeof teamSchema>;

type ErrorsState = Partial<Record<keyof TeamSchema, string>>;

export default function EditTeamForm({ onSuccess }: { onSuccess: () => void }) {
  const { session, pod } = useAuth();
  const { data } = useGetProfile(session, pod);
  const mutation = useUpdateTeam(session, pod);

  const [name, setName] = useState<string>(data?.team?.name ?? '');
  const [tag, setTag] = useState<string>(data?.team?.tag ?? '');
  const [founded, setFounded] = useState<string>(data?.team?.founded ?? '');
  const [location, setLocation] = useState<string>(data?.team?.location ?? '');

  const [errors, setErrors] = useState<ErrorsState>({});

  function handleFormSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});

    const validation = teamSchema.safeParse({ name, tag, founded, location });

    if (!validation.success) {
      const newErrors: { [key: string]: string | null } = {};
      validation.error.errors.forEach((error) => {
        newErrors[error.path[0]] = error.message;
      });

      setErrors(newErrors);
      return;
    }

    mutation.mutate(
      { name, tag, founded, location },
      {
        onSuccess,
      }
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="grid gap-4">
      <div>
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="FC Thunderbolt"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>
      <div>
        <Label htmlFor="tag">
          Tag <span className="text-destructive">*</span>
        </Label>
        <Input
          id="tag"
          type="text"
          placeholder="FCT"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className={errors.tag ? 'border-destructive' : ''}
        />
        {errors.tag && <p className="text-sm text-destructive">{errors.tag}</p>}
      </div>
      <div>
        <Label htmlFor="founded">Founded</Label>
        <Input
          id="founded"
          type="text"
          placeholder="1987"
          value={founded}
          onChange={(e) => setFounded(e.target.value)}
          className={errors.founded ? 'border-destructive' : ''}
        />
        {errors.founded && (
          <p className="text-sm text-destructive">{errors.founded}</p>
        )}
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          type="text"
          placeholder="Spring street, 87"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={errors.location ? 'border-destructive' : ''}
        />
        {errors.location && (
          <p className="text-sm text-destructive">{errors.location}</p>
        )}
      </div>
      <ButtonWithLoader
        type="submit"
        isLoading={mutation.isPending}
        disabled={mutation.isPending}
      >
        Save
      </ButtonWithLoader>
    </form>
  );
}
