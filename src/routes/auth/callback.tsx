import { useAuth } from '@/context/auth-context';
import {
  getDefaultSession,
  handleIncomingRedirect,
} from '@inrupt/solid-client-authn-browser';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/auth/callback')({
  component: RouteComponent,
});

function RouteComponent() {
  const { onAuthCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleRedirectAfterLogin() {
      await handleIncomingRedirect();

      const session = getDefaultSession();
      if (session.info.isLoggedIn) {
        localStorage.setItem('isAuthenticated', 'true');
        await onAuthCallback();
      } else {
        navigate({ to: '/auth/login' });
      }
    }

    handleRedirectAfterLogin();
  }, []);

  return <p>Signing in...</p>;
}
