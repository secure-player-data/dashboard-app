import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { useAuth } from '@/context/auth-context';
import { useNavigate } from '@tanstack/react-router';

export default function AuthLoading() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignout() {
    await signOut();
    navigate({ to: '/auth/login' });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted dark:bg-neutral-900 p-4">
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <Loader2 className="mx-auto size-10 text-primary animate-spin m-4" />
          <CardTitle className="text-2xl font-bold">Authenticating</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            We're verifying your credentials. This will only take a moment...
          </p>
        </CardContent>
        <CardFooter className="text-sm justify-center text-muted-foreground">
          Not working?{' '}
          <button onClick={handleSignout} className="underline ml-1">
            Try logging back in again
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
