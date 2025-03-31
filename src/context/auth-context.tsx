import React, { useContext, useEffect } from 'react';
import {
  EVENTS,
  getDefaultSession,
  handleIncomingRedirect,
  login,
  logout,
  Session,
} from '@inrupt/solid-client-authn-browser';
import {
  Link,
  useLocation,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { getPodUrl } from '@/api/utils';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, LogIn } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';

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
  const location = useLocation();

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

  const onLogin = async () => {
    console.log('on login');
    await updateState();
    navigate({ to: '/' });
  };

  const onSessionRestored = async (url: string) => {
    console.log('on session restored');
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
    setSession(null);
    navigate({ to: '/auth/login' });
  };

  const onAuthCallback = async () => {
    console.log('on auth callback');
    await updateState();
  };

  const updateState = async () => {
    const session = getDefaultSession();
    setSession(session);
    setPod(await getPodUrl(session));
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{ session, pod, signIn, signOut, onAuthCallback }}
    >
      {isLoading ? (
        <p>Loading...</p>
      ) : !pod && location.pathname !== '/auth/login' ? (
        <LoggedOut />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

function LoggedOut() {
  return (
    <div className="flex min-h-screen place-items-center bg-muted p-4">
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-warning/20">
            <AlertCircle className="h-10 w-10 text-warning animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Oops! You got logged out
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your session has expired or you've been logged out. Don't worry, it
            happens to the best of us!
          </p>
          <div className="mt-6 flex items-center justify-center">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-md bg-gradient-to-r from-pink-500 to-purple-500 opacity-75 blur-sm animate-pulse"></div>
              {/* <Button asChild size="lg" className="relative"> */}
              <Link
                to="/auth/login"
                className={`${buttonVariants({ size: 'lg' })} relative`}
              >
                <LogIn className="h-4 w-4" />
                <span>Back to Login</span>
              </Link>
              {/* </Button> */}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <p className="text-sm text-muted-foreground">
            Need help?{' '}
            <Link to="/" className="text-primary underline">
              Contact support
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
