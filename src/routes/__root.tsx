import * as React from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import AuthProvider from '@/context/auth-context';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/context/theme-provider';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <AuthProvider>
        <ThemeProvider>
          <Outlet />
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </React.Fragment>
  );
}
