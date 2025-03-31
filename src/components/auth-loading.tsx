import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';

export default function AuthLoading() {
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
      </Card>
    </div>
  );
}
