import { Button } from '@/components/ui/button';
import { isAuthenticated, useAuth } from '@/context/auth-context';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';

export const Route = createFileRoute('/auth/_setup')({
  component: RouteComponent,
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/auth/login' });
    }
  },
});

function RouteComponent() {
  const { signOut } = useAuth();

  return (
    <div>
      <header className="flex justify-end p-4">
        <Button onClick={signOut} variant="outline">
          <LogOut className="size-4" />
          Sign out
        </Button>
      </header>
      <Outlet />
    </div>
  );
}
