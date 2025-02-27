import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useInitProfile } from '@/use-cases/use-init-profile';
import { z } from 'zod';

const profileSchema = z.object({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  email: z.string().email(),
});

type ProfileSchema = z.infer<typeof profileSchema>;

type ErrorsState = Partial<Record<keyof ProfileSchema, string>>;

export function ProfileSetupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const { session, pod } = useAuth();
  const navigate = useNavigate();
  const mutation = useInitProfile(session, pod);

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const [errors, setErrors] = useState<ErrorsState>({});

  function handleFormSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});

    const validation = profileSchema.safeParse({ firstName, lastName, email });

    if (!validation.success) {
      const newErrors: { [key: string]: string | null } = {};
      validation.error.errors.forEach((error) => {
        newErrors[error.path[0]] = error.message;
      });

      setErrors(newErrors);
      return;
    }

    const fullName = firstName + ' ' + lastName;
    handleCreateAppProfile(fullName, email);
  }

  function handleCreateAppProfile(name: string, email: string) {
    mutation.mutate(
      { name, email },
      {
        onSuccess: () => navigate({ to: '/' }),
        onError: (err) => console.log('Error creating profile: ', err),
      }
    );
  }

  return (
    <div className="w-96">
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Setup your profile</CardTitle>
            <CardDescription>
              Provide us with your name and email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <form onSubmit={handleFormSubmit} className="grid gap-4">
                  <div>
                    <Label htmlFor="firstName">
                      First name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      required
                      onChange={(event) => {
                        setFirstName(event.target.value);
                      }}
                      className={
                        errors['firstName'] ? 'border-destructive' : ''
                      }
                    />
                    {errors['firstName'] && (
                      <p className="text-sm text-destructive">
                        {errors['firstName']}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">
                      Last name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      required
                      onChange={(event) => {
                        setLastName(event.target.value);
                      }}
                      className={errors['lastName'] ? 'border-destructive' : ''}
                    />
                    {errors['lastName'] && (
                      <p className="text-sm text-destructive">
                        {errors['lastName']}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="text"
                      placeholder="johndoe@securemail.com"
                      required
                      onChange={(event) => {
                        setEmail(event.target.value);
                      }}
                      className={errors['email'] ? 'border-destructive' : ''}
                    />
                    {errors['email'] && (
                      <p className="text-sm text-destructive">
                        {errors['email']}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      'Save'
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
