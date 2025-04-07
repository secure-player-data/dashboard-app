import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from '@tanstack/react-router';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import {
  CredentialsNotSetException,
  ProfileDoesNotExistException,
} from '@/exceptions/profile-data-exceptions';
import { usePageTitle } from '@/hooks/use-page-title';
import { useGetAccessPolicy } from '@/use-cases/access-controll';
import { ChevronRight, TriangleAlert, X } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { useGetProfile } from '@/use-cases/profile';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { useMemo } from 'react';

export const Route = createFileRoute('/__dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, pod } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  usePageTitle('Secure Player Data - Dashboard');

  const paths = useMemo(() => {
    const path = location.pathname;
    const pathParts = path.split('/').filter((part) => part !== '');
    return pathParts;
  }, [location.pathname]);

  const {
    error: profileError,
    data: profile,
    isFetching: profilePending,
  } = useGetProfile(session, pod);
  const { data: usesAcp } = useGetAccessPolicy(session, pod);

  useEffect(() => {
    handleRedirect();
  }, []);

  useEffect(() => {
    handleRedirect();
  }, [profileError, profile, profilePending]);

  function handleRedirect() {
    if (
      profileError instanceof ProfileDoesNotExistException ||
      profileError instanceof CredentialsNotSetException
    ) {
      navigate({ to: '/auth/profile' });
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="bg-muted-foreground h-4 w-[1px] rounded-full" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Secure Player Data</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {paths.includes('player') ? (
                  <div className="flex items-center gap-2">
                    <ChevronRight className="size-4" />
                    <BreadcrumbItem>
                      <BreadcrumbLink>{paths[paths.length - 1]}</BreadcrumbLink>
                    </BreadcrumbItem>
                  </div>
                ) : (
                  paths.map((path, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <ChevronRight className="size-4" />
                      <BreadcrumbItem>
                        <BreadcrumbLink>
                          {decodeURIComponent(path)}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </div>
                  ))
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="px-4 pb-4 h-full w-full">
          {usesAcp === false && <AccessPolicyWarning />}
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AccessPolicyWarning() {
  const [isDismissed, setDismissed] = useLocalStorage(
    'is-unsupported-policy-dismissed',
    false
  );

  if (isDismissed) {
    return null;
  }

  return (
    <div className="relative mb-4 border-2 border-yellow-400 bg-yellow-400/10 p-4 rounded-md">
      <TriangleAlert className="mb-2" />
      <h1 className="text-lg font-semibold">Unsupported Access Policy</h1>
      <p className="text-sm">
        Your pod provider does not support ACP policy. Because of this, some of
        the features in this app might not work as expected!
      </p>
      <Button
        variant="ghost"
        className="absolute top-2 right-2 hover:bg-yellow-400/50 p-2"
        onClick={() => setDismissed(true)}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
