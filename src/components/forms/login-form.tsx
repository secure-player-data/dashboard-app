import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { FormEvent, useState } from 'react';
import { safeCall } from '@/utils.ts';
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/context/auth-context';
import { log } from '@/lib/log';

const redirectUri = encodeURIComponent(import.meta.env.VITE_APP_BASE_URL);

const providers = {
  inrupt: 'https://login.inrupt.com',
};

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const { signIn } = useAuth();
  const [issuer, setIssuer] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleFormSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMsg(null);

    if (issuer.trim() === '') {
      setErrorMsg('Issuer cannot be empty');
      return;
    }

    handleLogin(issuer);
  }

  async function handleProviderLogin(issuer: keyof typeof providers) {
    await handleLogin(providers[issuer]);
  }

  async function handleLogin(issuerUrl: string) {
    const [error, _] = await safeCall(signIn(issuerUrl));

    if (error) {
      log({
        type: 'error',
        label: 'Login Form',
        message: error.message,
        obj: error,
      });
      setErrorMsg('Invalid issuer URL');
    }
  }

  return (
    <div>
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Login with your Solid Issuer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <form onSubmit={handleFormSubmit} className="grid gap-2">
                  <Label htmlFor="webID">Your Solid Issuer</Label>
                  <Input
                    id="webID"
                    type="text"
                    placeholder="https://id.provider.com/name"
                    required
                    onChange={(event) => {
                      setIssuer(event.target.value);
                    }}
                  />
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                  {errorMsg && (
                    <p className="text-destructive text-center text-sm">
                      {errorMsg}
                    </p>
                  )}
                </form>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Or login with
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleProviderLogin('inrupt')}
                  >
                    <img src="/inrupt-logo.png" alt="Inrupt" className="h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
          By clicking continue, you agree to our{' '}
          <Link hash="#" to={'/auth/login'}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link hash="#" to={'/auth/login'}>
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
