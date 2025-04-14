import React, { useContext, useEffect } from 'react';
import {
  EVENTS,
  getDefaultSession,
  login,
  logout,
  Session,
} from '@inrupt/solid-client-authn-browser';
import { useNavigate } from '@tanstack/react-router';
import { getPodUrl } from '@/api/utils';
import AuthLoading from '@/components/auth-loading';
import { sortAppendContainer } from '@/api/background-processes';

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

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = React.useState<Session | null>(
    initialValue.session
  );
  const [pod, setPod] = React.useState<string | null>(initialValue.pod);

  const [isLoading, setIsLoading] = React.useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      // Subscribe to events
      session.events.on(EVENTS.LOGIN, onLogin);
      session.events.on(EVENTS.LOGOUT, updateState);
      session.events.on(EVENTS.SESSION_RESTORED, onSessionRestored);
      session.events.on(EVENTS.SESSION_EXPIRED, updateState);
      session.events.on(EVENTS.SESSION_EXTENDED, updateState);
      session.events.on(EVENTS.NEW_REFRESH_TOKEN, updateState);

      // Refresh session on page load
      session
        .handleIncomingRedirect({ restorePreviousSession: true })
        .then((data) => {
          if (!data?.isLoggedIn) {
            clear();
            navigate({ to: '/auth/login' });
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    // Unsubscribe from events when the component is unmounted
    return () => {
      session?.events.off(EVENTS.LOGIN, onLogin);
      session?.events.off(EVENTS.LOGOUT, updateState);
      session?.events.off(EVENTS.SESSION_RESTORED, onSessionRestored);
      session?.events.off(EVENTS.SESSION_EXPIRED, updateState);
      session?.events.off(EVENTS.SESSION_EXTENDED, updateState);
      session?.events.off(EVENTS.NEW_REFRESH_TOKEN, updateState);
    };
  }, []);

  const onLogin = async () => {
    await updateState();
    navigate({ to: '/' });
  };

  const onSessionRestored = async (url: string) => {
    await updateState();

    const parts = url.split('/').filter((part) => part !== '');
    const relative = parts.slice(2).join('/');
    navigate({ to: relative === '' ? '/' : `/${relative}` });
  };

  const signIn = async (provider: string) => {
    await login({
      oidcIssuer: provider,
      redirectUrl: new URL('/auth/callback', window.location.href).toString(),
      clientName: 'Secure Player Data',
      // clientId: !import.meta.env.DEV
      //   ? 'https://secure-player-data.onrender.com/app-id.jsonld'
      //   : undefined,
      tokenType: 'DPoP',
    });
  };

  const signOut = async () => {
    await logout({
      logoutType: 'app',
    });
    await updateState();
  };

  const onAuthCallback = async () => {
    await updateState();
  };

  const updateState = async () => {
    const session = getDefaultSession();
    if (session.info.isLoggedIn) {
      setSession(session);
      setPod(await getPodUrl(session));
    } else {
      clear();
      navigate({ to: '/auth/login' });
    }
    setIsLoading(false);
  };

  const clear = () => {
    setSession(null);
    setPod(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, pod, signIn, signOut, onAuthCallback }}
    >
      {isLoading ? <AuthLoading /> : children}
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

export default AuthProvider;
