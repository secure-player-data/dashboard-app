import React, { useContext, useEffect } from 'react';
import {
  EVENTS,
  getDefaultSession,
  handleIncomingRedirect,
  login,
  logout,
  Session,
} from '@inrupt/solid-client-authn-browser';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { getPodUrl } from '@/api/utils';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, LogIn } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import AuthLoading from '@/components/auth-loading';

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
      // Refresh session on page load
      handleIncomingRedirect({ restorePreviousSession: true })
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
      tokenType: 'DPoP',
    });
  };

  const signOut = async () => {
    await logout({
      logoutType: 'app',
    });
    clear();
    navigate({ to: '/auth/login' });
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
