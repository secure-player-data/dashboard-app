import React, { useContext, useEffect } from 'react';
import {
  EVENTS,
  getDefaultSession,
  handleIncomingRedirect,
  login,
  logout,
  Session,
} from '@inrupt/solid-client-authn-browser';
import { useNavigate } from '@tanstack/react-router';
import { getPodUrl } from '@/api/utils';

interface IAuthContext {
  session: Session | null;
  pod: string | null;
  signIn: (provider: string) => Promise<void>;
  signOut: () => Promise<void>;
  onAuthCallback: () => void;
}

const initialValue: IAuthContext = {
  session: getDefaultSession(),
  pod: null,
  signIn: async () => {},
  signOut: async () => {},
  onAuthCallback: () => {},
};

const AuthContext = React.createContext<IAuthContext>(initialValue);

const LOCAL_STORAGE_KEY = 'isAuthenticated';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = React.useState<Session | null>(
    initialValue.session
  );
  const [pod, setPod] = React.useState<string | null>(initialValue.pod);

  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      // Refresh session on page load
      handleIncomingRedirect({ restorePreviousSession: true });
    }
  }, []);

  // Subscribe to auth events when session is changed
  useEffect(() => {
    if (session) {
      // Subscribe to events
      session.events.on(EVENTS.LOGIN, onLogin);
      session.events.on(EVENTS.SESSION_RESTORED, onSessionRestored);
    }

    // Unsubscribe from events when the component is unmounted
    () => {
      session?.events.off(EVENTS.LOGIN, onLogin);
      session?.events.off(EVENTS.SESSION_RESTORED, onSessionRestored);
    };
  }, [session]);

  const onLogin = () => {
    navigate({ to: '/' });
  };

  const onSessionRestored = (url: string) => {
    const parts = url.split('/').filter((part) => part !== '');
    const relative = parts.slice(2).join('/');
    navigate({ to: relative === '' ? '/' : `/${relative}` });
  };

  const signIn = async (provider: string) => {
    await login({
      oidcIssuer: provider,
      redirectUrl: new URL('/auth/callback', window.location.href).toString(),
      clientName: 'Secure Player Data',
      tokenType: 'DPoP',
    });
  };

  const signOut = async () => {
    await logout({
      logoutType: 'app',
    });
    localStorage.removeItem('isAuthenticated');
    setSession(null);
    navigate({ to: '/auth/login' });
  };

  const onAuthCallback = async () => {
    const session = getDefaultSession();
    setSession(session);
    setPod(await getPodUrl(session));
  };

  return (
    <AuthContext.Provider
      value={{ session, pod, signIn, signOut, onAuthCallback }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const isAuthenticated = () => {
  return localStorage.getItem(LOCAL_STORAGE_KEY) === 'true';
};

export default AuthProvider;
