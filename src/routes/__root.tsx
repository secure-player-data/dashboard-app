import * as React from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import AuthProvider from '@/context/auth-context';
import { Toaster } from '@/components/ui/sonner';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <AuthProvider>
        <Outlet />
        <Toaster />
      </AuthProvider>
    </React.Fragment>
  );
}
